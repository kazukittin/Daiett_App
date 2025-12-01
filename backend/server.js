import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { clearTokens, loadTokens, saveTokens } from "./fitbitTokenStore.js";
import weightRoutes from "./routes/weightRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import calorieRoutes from "./routes/calorieRoutes.js";
import calorieProfileRoutes from "./routes/calorieProfileRoutes.js";
import foodSetRoutes from "./routes/foodSetRoutes.js";
import { getWorkoutSummaryForDate } from "./services/workoutService.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weight", weightRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/calories", calorieRoutes);
app.use("/api/calories", calorieProfileRoutes);
app.use("/api", foodSetRoutes);

const AUTHORIZE_URL = "https://www.fitbit.com/oauth2/authorize";
const TOKEN_URL = "https://api.fitbit.com/oauth2/token";

const getAuthHeader = () =>
  `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`;

const ensureEnv = () => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Fitbitクライアント情報が設定されていません");
  }
};

const exchangeCodeForToken = async (code) => {
  ensureEnv();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
  });

  const response = await axios.post(TOKEN_URL, params.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token, expires_in, user_id } = response.data;
  const expiresAt = Date.now() + expires_in * 1000;

  return saveTokens({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt,
    userId: user_id,
    lastSync: null,
  });
};

const refreshAccessToken = async () => {
  ensureEnv();
  const tokens = loadTokens();
  if (!tokens.refreshToken) {
    throw new Error("Fitbit refresh token not available");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refreshToken,
  });

  const response = await axios.post(TOKEN_URL, params.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token, expires_in } = response.data;
  const expiresAt = Date.now() + expires_in * 1000;

  return saveTokens({
    ...tokens,
    accessToken: access_token,
    refreshToken: refresh_token ?? tokens.refreshToken,
    expiresAt,
  });
};

const ensureValidToken = async () => {
  const tokens = loadTokens();
  if (!tokens.accessToken) {
    throw new Error("Fitbit not linked");
  }

  const isExpired = !tokens.expiresAt || Date.now() > tokens.expiresAt - 60_000;
  if (isExpired) {
    return refreshAccessToken();
  }

  return tokens;
};

const getTodayISO = () => new Date().toISOString().split("T")[0];

const fetchTodayActivities = async (accessToken, date = getTodayISO()) => {
  const response = await axios.get(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const summary = response.data?.summary ?? {};
  const activeMinutes =
    (summary.veryActiveMinutes || 0) +
    (summary.fairlyActiveMinutes || 0) +
    (summary.lightlyActiveMinutes || 0);

  return {
    steps: summary.steps ?? 0,
    caloriesOut: summary.caloriesOut ?? 0,
    activeMinutes,
    restingHeartRate: summary.restingHeartRate,
  };
};

app.get("/auth/fitbit", (req, res) => {
  try {
    ensureEnv();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "activity heartrate profile",
      prompt: "consent",
    });

    res.redirect(`${AUTHORIZE_URL}?${params.toString()}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/auth/fitbit/callback", async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.status(400).send(`Fitbit連携でエラーが発生しました: ${error}`);
  }

  if (!code) {
    return res.status(400).send("認可コードが見つかりませんでした");
  }

  try {
    await exchangeCodeForToken(code);
    res.send("Fitbitとの連携が完了しました。アプリに戻ってデータを確認してください。");
  } catch (err) {
    console.error("Fitbit callback error", err?.response?.data || err.message);
    res.status(500).send("Fitbit連携に失敗しました");
  }
});

app.get("/api/fitbit/today", async (req, res) => {
  let tokens;
  try {
    tokens = await ensureValidToken();
  } catch (error) {
    const message = error.message || "Fitbit連携が必要です";
    return res.status(401).json({ connected: false, message });
  }

  try {
    const summary = await fetchTodayActivities(tokens.accessToken);
    const lastSync = new Date().toISOString();
    saveTokens({ ...tokens, lastSync });

    res.json({ connected: true, summary, lastSync });
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        tokens = await refreshAccessToken();
        const summary = await fetchTodayActivities(tokens.accessToken);
        const lastSync = new Date().toISOString();
        saveTokens({ ...tokens, lastSync });
        return res.json({ connected: true, summary, lastSync });
      } catch (refreshError) {
        console.error("Fitbit refresh failed", refreshError?.response?.data || refreshError.message);
        clearTokens();
        return res.status(401).json({ connected: false, message: "Fitbit認証が無効です。再連携してください。" });
      }
    }

    console.error("Failed to fetch Fitbit data", error?.response?.data || error.message);
    res.status(500).json({ connected: false, message: "Fitbitデータの取得に失敗しました" });
  }
});

const stepsToCalories = (steps) => {
  const kcalPerStep = 0.04;
  const baseCalories = Number.isFinite(steps) ? steps * kcalPerStep : 0;
  return Math.round(baseCalories);
};

app.get("/api/calories/today", async (req, res) => {
  const today = getTodayISO();
  const { totalCalories: baseCalories = 0 } = getWorkoutSummaryForDate(today) || {};

  let steps = 0;
  let fitbitStepsCalories = 0;
  let fitbitConnected = false;
  let tokens = null;

  try {
    tokens = await ensureValidToken();
    const summary = await fetchTodayActivities(tokens.accessToken, today);
    const lastSync = new Date().toISOString();
    saveTokens({ ...tokens, lastSync });

    steps = Number(summary.steps) || 0;
    fitbitStepsCalories = stepsToCalories(steps);
    fitbitConnected = true;
  } catch (error) {
    const message = error?.message || "Fitbitデータの取得に失敗しました";
    console.error("/api/calories/today error", error?.response?.data || message);
    return res.json({
      baseCalories,
      fitbitStepsCalories: 0,
      totalCalories: baseCalories,
      steps: 0,
      fitbitConnected,
      message,
    });
  }

  const totalCalories = baseCalories + fitbitStepsCalories;

  res.json({
    baseCalories,
    fitbitStepsCalories,
    totalCalories,
    steps,
    fitbitConnected,
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Fitbit backend listening on http://localhost:${PORT}`);
});
