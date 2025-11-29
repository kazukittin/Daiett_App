import { store, isValidDateString } from "../data/store.js";

// Meal totals and validation are owned by the backend so the frontend only submits
// user input and renders the returned summaries.

export const getMealRecords = (range = {}) => store.listMealRecords(range);

export const addMealRecord = (payload) => {
  if (!payload?.date || !isValidDateString(payload.date)) {
    const error = new Error("日付はYYYY-MM-DD形式で指定してください");
    error.status = 400;
    throw error;
  }
  if (!payload?.mealType) {
    const error = new Error("食事タイプは必須です");
    error.status = 400;
    throw error;
  }

  const foods = Array.isArray(payload.foods)
    ? payload.foods
        .filter((food) => food?.name)
        .map((food) => ({
          name: food.name.trim(),
          portion: food.portion ?? "",
          calories: Number(food.calories) || 0,
        }))
    : [];

  const hasFoodName = foods.some((food) => food.name.trim() !== "");
  if (!hasFoodName) {
    const error = new Error("食品名を1つ以上入力してください");
    error.status = 400;
    throw error;
  }

  const invalidCalories = foods.some((food) => food.calories < 0 || !Number.isFinite(food.calories));
  if (invalidCalories) {
    const error = new Error("カロリーは0以上の数値で入力してください");
    error.status = 400;
    throw error;
  }

  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);

  return store.addMealRecord({
    mealType: payload.mealType,
    date: payload.date,
    memo: payload.memo ?? "",
    foods,
    totalCalories,
  });
};

export const getMealSummaryForDate = (date) => {
  const records = store.listMealRecords({ from: date, to: date });
  const totalCalories = records.reduce((sum, meal) => sum + (Number(meal.totalCalories) || 0), 0);
  return {
    date,
    totalCalories,
    count: records.length,
    records,
  };
};
