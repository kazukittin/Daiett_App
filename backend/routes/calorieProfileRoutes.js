import { Router } from "express";
import { clearProfile, loadProfile, saveProfile } from "../calorieProfileStore.js";

const router = Router();

const validSexes = new Set(["male", "female"]);
const validActivity = new Set(["low", "light", "moderate", "high"]);
const validGoals = new Set(["lose", "maintain", "gain"]);

const isValidNumber = (value) => typeof value === "number" && Number.isFinite(value);

router.get("/profile", async (req, res) => {
  try {
    const profile = await loadProfile();
    if (!profile) {
      return res.status(404).json({ message: "Profile not set" });
    }
    return res.json({ profile });
  } catch (error) {
    console.error("Failed to load calorie profile", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.put("/profile", async (req, res) => {
  const { heightCm, age, sex, activityLevel, goal, targetWeight } = req.body || {};

  if (
    !isValidNumber(heightCm) ||
    !isValidNumber(age) ||
    !validSexes.has(sex) ||
    !validActivity.has(activityLevel) ||
    !validGoals.has(goal)
  ) {
    return res.status(400).json({
      message:
        "Invalid input. Provide numeric heightCm/age and valid sex, activityLevel, and goal values.",
    });
  }

  const profile = { heightCm, age, sex, activityLevel, goal };
  if (isValidNumber(targetWeight)) {
    profile.targetWeight = targetWeight;
  }

  try {
    await saveProfile(profile);
    return res.json({ profile });
  } catch (error) {
    console.error("Failed to save calorie profile", error);
    return res.status(500).json({ message: "Failed to save profile" });
  }
});

router.delete("/profile", async (req, res) => {
  try {
    await clearProfile();
    return res.status(204).end();
  } catch (error) {
    console.error("Failed to clear calorie profile", error);
    return res.status(500).json({ message: "Failed to clear profile" });
  }
});

export default router;
