import { addMealRecord } from "./mealService.js";
import { isValidDateString, store } from "../data/store.js";

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

export const listFoodSets = async () => store.listFoodSets();

export const createFoodSet = async (payload) => store.addFoodSet(validatePayload(payload));

export const updateFoodSet = async (id, payload) => {
  const updated = store.updateFoodSet(id, validatePayload(payload));
  if (!updated) {
    const error = new Error("指定されたセットが見つかりません");
    error.status = 404;
    throw error;
  }
  return updated;
};

export const deleteFoodSet = async (id) => store.deleteFoodSet(id);

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

  const sets = await listFoodSets();
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
