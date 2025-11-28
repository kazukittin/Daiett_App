import express from "express";
import { addMealRecord, getMealRecords, getMealSummaryForDate } from "../services/mealService.js";

const router = express.Router();

router.get("/summary", (req, res, next) => {
  try {
    const date = req.query.date;
    if (!date) {
      const error = new Error("date クエリパラメータは必須です");
      error.status = 400;
      throw error;
    }
    const summary = getMealSummaryForDate(date);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/records", (req, res) => {
  const { from, to } = req.query;
  const records = getMealRecords({ from, to });
  res.json({ records });
});

router.post("/records", (req, res, next) => {
  try {
    const created = addMealRecord(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

export default router;
