import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { addMealRecord } from "./mealService.js";
import { isValidDateString } from "../data/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "foodSets.json");

const ensureFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
};

const readSets = async () => {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw || "[]");
};

const writeSets = async (sets) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(sets, null, 2), "utf-8");
};

const validateItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    const error = new Error("食品セットには1件以上のアイテムが必要です");
    error.status = 400;
    throw error;
  }

  const sanitized = items.map((item) => ({
    name: String(item?.name ?? "").trim(),
    calories: Number(item?.calories) || 0,
  }));

  const hasName = sanitized.some((item) => item.name);
  if (!hasName) {
    const error = new Error("食品名を入力してください");
    error.status = 400;
    throw error;
  }

  const invalidCalories = sanitized.some((item) => item.calories < 0 || !Number.isFinite(item.calories));
  if (invalidCalories) {
    const error = new Error("カロリーは0以上の数値で入力してください");
    error.status = 400;
    throw error;
  }

  return sanitized;
};

const validatePayload = (payload) => {
  const name = String(payload?.name ?? "").trim();
  if (!name) {
    const error = new Error("セット名は必須です");
    error.status = 400;
    throw error;
  }

  const items = validateItems(payload.items);
  const description = payload?.description ? String(payload.description) : "";
  const totalCalories = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

  return { name, description, items, totalCalories };
};

export const listFoodSets = async () => readSets();

export const createFoodSet = async (payload) => {
  const next = validatePayload(payload);
  const sets = await readSets();
  const id = `fs_${Date.now().toString(36)}`;
  const created = { id, ...next };
  sets.push(created);
  await writeSets(sets);
  return created;
};

export const updateFoodSet = async (id, payload) => {
  const sets = await readSets();
  const index = sets.findIndex((item) => item.id === id);
  if (index === -1) {
    const error = new Error("指定されたセットが見つかりません");
    error.status = 404;
    throw error;
  }

  const updated = { id, ...validatePayload(payload) };
  sets[index] = updated;
  await writeSets(sets);
  return updated;
};

export const deleteFoodSet = async (id) => {
  const sets = await readSets();
  const next = sets.filter((item) => item.id !== id);
  await writeSets(next);
};

export const applyFoodSet = async (id, { date, mealType }) => {
  if (!date || !isValidDateString(date)) {
    const error = new Error("日付はYYYY-MM-DD形式で指定してください");
    error.status = 400;
    throw error;
  }
  if (!mealType) {
    const error = new Error("mealTypeは必須です");
    error.status = 400;
    throw error;
  }

  const sets = await readSets();
  const target = sets.find((item) => item.id === id);
  if (!target) {
    const error = new Error("指定されたセットが見つかりません");
    error.status = 404;
    throw error;
  }

  const foods = target.items.map((item) => ({ name: item.name, calories: item.calories }));
  const record = addMealRecord({ date, mealType, foods, memo: target.description ?? "" });

  return {
    appliedSetId: id,
    totalCaloriesAdded: record.totalCalories,
    appliedTo: { date, mealType },
    record,
  };
};
