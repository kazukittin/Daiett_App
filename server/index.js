import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import { URL } from "node:url";

const ENV_PATH = new URL("../.env", import.meta.url);

const loadEnvFile = () => {
  try {
    const envText = fs.readFileSync(ENV_PATH, "utf8");
    envText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const [key, ...rest] = line.split("=");
        const value = rest.join("=");
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to read .env file", error);
    }
  }
};

loadEnvFile();

const FITBIT_CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const FITBIT_CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const FITBIT_REDIRECT_URI = process.env.FITBIT_REDIRECT_URI || "http://localhost:3001/auth/fitbit/callback";
const PORT = Number(process.env.PORT || 3001);

const tokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
  lastSync: null,
};

const respondJson = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
};

const sendHtml = (res, status, html) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
};

const fetchJson = async (url, options = {}) => {
  const agent = url.startsWith("https") ? https : http;
  return fetch(url, { agent, ...options });
};

const buildAuthorizeUrl = () => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: FITBIT_CLIENT_ID,
    redirect_uri: FITBIT_REDIRECT_URI,
    scope: "activity heartrate profile",
    expires_in: "604800",
  });
  return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
};

const exchangeToken = async ({ code, refreshToken }) => {
  const body = new URLSearchParams({
    grant_type: refreshToken ? "refresh_token" : "authorization_code",
  });

  if (refreshToken) {
    body.append("refresh_token", refreshToken);
  } else {
    body.append("code", code);
    body.append("redirect_uri", FITBIT_REDIRECT_URI);
  }

  const credentials = Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString("base64");

  const response = await fetchJson("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data;
};

const ensureAccessToken = async () => {
  if (tokenStore.accessToken && Date.now() < tokenStore.expiresAt) return tokenStore.accessToken;

  if (tokenStore.refreshToken) {
    const refreshed = await exchangeToken({ refreshToken: tokenStore.refreshToken });
    tokenStore.accessToken = refreshed.access_token;
    tokenStore.refreshToken = refreshed.refresh_token || tokenStore.refreshToken;
    tokenStore.expiresAt = Date.now() + (refreshed.expires_in || 3600) * 1000 - 60_000;
    return tokenStore.accessToken;
  }

  return null;
};

const handleAuthStart = (res) => {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) {
    respondJson(res, 500, { error: "Fitbit client credentials are not configured." });
    return;
  }

  const redirectUrl = buildAuthorizeUrl();
  res.statusCode = 302;
  res.setHeader("Location", redirectUrl);
  res.end();
};

const handleAuthCallback = async (req, res, searchParams) => {
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    sendHtml(res, 400, `<h3>Fitbit authorization failed</h3><p>${error}</p>`);
    return;
  }

  if (!code) {
    sendHtml(res, 400, "<h3>Missing authorization code.</h3>");
    return;
  }

  try {
    const tokens = await exchangeToken({ code });
    tokenStore.accessToken = tokens.access_token;
    tokenStore.refreshToken = tokens.refresh_token;
    tokenStore.expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000 - 60_000;

    sendHtml(
      res,
      200,
      "<h3>Fitbit 連携が完了しました。</h3><p>このウィンドウを閉じてアプリに戻ってください。</p>",
    );
  } catch (exchangeError) {
    console.error(exchangeError);
    sendHtml(res, 500, "<h3>Fitbit の認証に失敗しました。</h3>");
  }
};

const fetchTodaySummary = async (dateIso) => {
  const accessToken = await ensureAccessToken();
  if (!accessToken) throw new Error("Fitbit is not connected.");

  const url = `https://api.fitbit.com/1/user/-/activities/date/${dateIso}.json`;
  const response = await fetchJson(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 && tokenStore.refreshToken) {
    const refreshedToken = await ensureAccessToken();
    const retryResponse = await fetchJson(url, {
      headers: {
        Authorization: `Bearer ${refreshedToken}`,
      },
    });
    if (!retryResponse.ok) throw new Error(`Fitbit API error: ${retryResponse.status}`);
    return retryResponse.json();
  }

  if (!response.ok) {
    throw new Error(`Fitbit API error: ${response.status}`);
  }

  return response.json();
};

const handleTodayApi = async (res) => {
  const today = new Date();
  const dateIso = today.toISOString().slice(0, 10);

  try {
    const json = await fetchTodaySummary(dateIso);
    tokenStore.lastSync = new Date().toISOString();

    const summary = json?.summary || {};
    const activities = {
      steps: summary.steps ?? null,
      caloriesOut: summary.caloriesOut ?? null,
      activeMinutes:
        (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0) + (summary.lightlyActiveMinutes || 0),
      restingHeartRate: summary.restingHeartRate ?? null,
      date: dateIso,
    };

    respondJson(res, 200, activities);
  } catch (error) {
    console.error("Failed to fetch Fitbit data", error);
    respondJson(res, 500, { error: error.message });
  }
};

const handleStatus = (res) => {
  respondJson(res, 200, {
    connected: Boolean(tokenStore.accessToken),
    lastSync: tokenStore.lastSync,
  });
};

const requestListener = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    respondJson(res, 200, {});
    return;
  }

  if (url.pathname === "/auth/fitbit" && req.method === "GET") {
    handleAuthStart(res);
    return;
  }

  if (url.pathname === "/auth/fitbit/callback" && req.method === "GET") {
    await handleAuthCallback(req, res, url.searchParams);
    return;
  }

  if (url.pathname === "/api/fitbit/today" && req.method === "GET") {
    await handleTodayApi(res);
    return;
  }

  if (url.pathname === "/api/fitbit/status" && req.method === "GET") {
    handleStatus(res);
    return;
  }

  respondJson(res, 404, { error: "Not found" });
};

const server = http.createServer((req, res) => {
  requestListener(req, res).catch((error) => {
    console.error("Unhandled server error", error);
    respondJson(res, 500, { error: "Internal server error" });
  });
});

server.listen(PORT, () => {
  console.log(`Fitbit helper server running on http://localhost:${PORT}`);
});
