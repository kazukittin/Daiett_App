import { Router } from "express";
import {
  listFoodSets,
  createFoodSet,
  updateFoodSet,
  deleteFoodSet,
  applyFoodSet,
} from "../services/foodSetService.js";

const router = Router();

router.get("/food-sets", async (req, res, next) => {
  try {
    const sets = await listFoodSets();
    res.json({ sets });
  } catch (error) {
    next(error);
  }
});

router.post("/food-sets", async (req, res, next) => {
  try {
    const created = await createFoodSet(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/food-sets/:id", async (req, res, next) => {
  try {
    const updated = await updateFoodSet(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/food-sets/:id", async (req, res, next) => {
  try {
    await deleteFoodSet(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/food-sets/:id/apply", async (req, res, next) => {
  try {
    const result = await applyFoodSet(req.params.id, req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
