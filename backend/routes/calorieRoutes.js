import { Router } from "express";

const router = Router();

const activityFactors = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const validSexes = new Set(["male", "female"]);

const isValidNumber = (value) => typeof value === "number" && Number.isFinite(value);

router.post("/recommendation", (req, res) => {
  const { weightKg, heightCm, age, sex, activityLevel } = req.body || {};

  if (
    !isValidNumber(weightKg) ||
    !isValidNumber(heightCm) ||
    !isValidNumber(age) ||
    !validSexes.has(sex) ||
    !activityFactors[activityLevel]
  ) {
    return res.status(400).json({
      error:
        "Invalid input. Ensure weightKg, heightCm, age are numbers and sex and activityLevel are valid values.",
    });
  }

  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(sex === "male" ? bmrBase + 5 : bmrBase - 161);

  const activityFactor = activityFactors[activityLevel];
  const tdee = Math.round(bmr * activityFactor);

  return res.json({
    bmr,
    tdee,
    activityLevel,
  });
});

export default router;
