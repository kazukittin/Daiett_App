import express from "express";
import {
  addExerciseRecord,
  getExerciseRecords,
  getWorkoutSettings,
  saveWorkoutSettings,
  getWorkoutSummaryForDate,
  getTodayWorkoutStatus,
  markTodayWorkoutComplete,
} from "../services/workoutService.js";
import {
  listWorkoutTypes,
  createWorkoutType,
  updateWorkoutType,
  deleteWorkoutType,
} from "../services/workoutTypeService.js";

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

router.get("/types", (req, res) => {
  const types = listWorkoutTypes();
  res.json({ types });
});

router.post("/types", (req, res, next) => {
  try {
    const created = createWorkoutType(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/types/:id", (req, res, next) => {
  try {
    const updated = updateWorkoutType(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/types/:id", (req, res, next) => {
  try {
    deleteWorkoutType(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/today/status", (req, res) => {
  const status = getTodayWorkoutStatus();
  res.json(status);
});

router.post("/today/complete", (req, res) => {
  const status = markTodayWorkoutComplete();
  res.status(201).json(status);
});

export default router;
