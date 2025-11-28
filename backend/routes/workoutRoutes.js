import express from "express";
import {
  addExerciseRecord,
  getExerciseRecords,
  getWorkoutSettings,
  saveWorkoutSettings,
  getWorkoutSummaryForDate,
} from "../services/workoutService.js";

const router = express.Router();

router.get("/settings", (req, res) => {
  const settings = getWorkoutSettings();
  res.json(settings);
});

router.post("/settings", (req, res) => {
  const saved = saveWorkoutSettings(req.body);
  res.json(saved);
});

router.get("/summary", (req, res, next) => {
  try {
    const date = req.query.date;
    if (!date) {
      const error = new Error("date クエリパラメータは必須です");
      error.status = 400;
      throw error;
    }
    const summary = getWorkoutSummaryForDate(date);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/records", (req, res) => {
  const { from, to } = req.query;
  const records = getExerciseRecords({ from, to });
  res.json({ records });
});

router.post("/records", (req, res, next) => {
  try {
    const created = addExerciseRecord(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

export default router;
