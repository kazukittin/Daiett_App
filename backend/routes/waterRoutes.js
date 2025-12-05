import express from "express";
import { store, isValidDateString } from "../data/store.js";

const router = express.Router();

// GET /api/water?date=YYYY-MM-DD
router.get("/", (req, res) => {
    const { date, from, to } = req.query;
    let range = {};

    if (date && isValidDateString(date)) {
        range = { from: date, to: date };
    } else if (from && to) {
        range = { from, to };
    }

    const records = store.listWaterRecords(range);
    res.json(records);
});

// POST /api/water
router.post("/", (req, res) => {
    const { amount, date } = req.body;

    if (!amount || !date) {
        return res.status(400).json({ message: "Amount and date are required" });
    }

    const record = store.addWaterRecord({
        amount: Number(amount),
        date,
        timestamp: new Date().toISOString(),
    });

    res.status(201).json(record);
});

// DELETE /api/water/:id
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const deleted = store.deleteWaterRecord(id);

    if (!deleted) {
        return res.status(404).json({ message: "Record not found" });
    }

    res.status(204).send();
});

export default router;
