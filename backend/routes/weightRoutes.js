import express from "express";
import { addWeightRecord, getWeightRecords, getWeightSummary, getWeightTrend } from "../services/weightService.js";

const router = express.Router();

router.get("/summary", (req, res) => {
  const summary = getWeightSummary();
  res.json(summary);
});

router.get("/records", (req, res) => {
  const { from, to } = req.query;
  const records = getWeightRecords({ from, to });
  res.json({ records });
});

router.post("/records", (req, res, next) => {
  try {
    const record = addWeightRecord(req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.get("/trend", (req, res) => {
  const period = req.query.period || "7d";
  const trend = getWeightTrend(period);
  res.json(trend);
});

export default router;
