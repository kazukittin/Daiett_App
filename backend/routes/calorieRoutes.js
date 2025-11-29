import { Router } from "express";

const router = Router();

const activityFactors = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const validGoals = new Set(["lose", "maintain", "gain"]);
const validSexes = new Set(["male", "female"]);

const isValidNumber = (value) => typeof value === "number" && Number.isFinite(value);

router.post("/recommendation", (req, res) => {
  const { weightKg, heightCm, age, sex, activityLevel, goal } = req.body || {};

  if (
    !isValidNumber(weightKg) ||
    !isValidNumber(heightCm) ||
    !isValidNumber(age) ||
    !validSexes.has(sex) ||
    !activityFactors[activityLevel] ||
    !validGoals.has(goal)
  ) {
    return res.status(400).json({
      error:
        "Invalid input. Ensure weightKg, heightCm, age are numbers and sex, activityLevel, and goal are valid values.",
    });
  }

  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(sex === "male" ? bmrBase + 5 : bmrBase - 161);

  const activityFactor = activityFactors[activityLevel];
  const tdee = Math.round(bmr * activityFactor);

  const goalAdjustments = {
    lose: -400,
    maintain: 0,
    gain: 300,
  };

  const targetCalories = Math.round(tdee + goalAdjustments[goal]);

  return res.json({
    bmr,
    tdee,
    targetCalories,
    goal,
    activityLevel,
  });
});

export default router;
