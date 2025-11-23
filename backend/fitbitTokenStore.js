import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, "data", "fitbitTokens.json");

const defaultTokens = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
  userId: null,
  lastSync: null,
};

export function loadTokens() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { ...defaultTokens };
    }

    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...defaultTokens, ...parsed };
  } catch (error) {
    console.error("Failed to load Fitbit tokens", error);
    return { ...defaultTokens };
  }
}

export function saveTokens(tokens) {
  try {
    const payload = { ...defaultTokens, ...tokens };
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(payload, null, 2));
    return payload;
  } catch (error) {
    console.error("Failed to save Fitbit tokens", error);
    return undefined;
  }
}

export function clearTokens() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      fs.unlinkSync(STORE_PATH);
    }
  } catch (error) {
    console.error("Failed to clear Fitbit tokens", error);
  }
}
