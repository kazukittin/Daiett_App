import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_PATH = path.join(__dirname, "calorieProfile.json");

export async function loadProfile() {
  try {
    const data = await fs.readFile(PROFILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function saveProfile(profile) {
  const data = JSON.stringify(profile, null, 2);
  await fs.writeFile(PROFILE_PATH, data, "utf-8");
  return profile;
}

export async function clearProfile() {
  try {
    await fs.unlink(PROFILE_PATH);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
