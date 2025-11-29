import { store, isValidDateString } from "../data/store.js";

// Workout planning, validation, and summaries live here so React components rely on
// the API rather than duplicating business rules in the browser.

const sanitizeMenu = (menu) => ({
  name: menu?.name?.trim() || "",
  type: menu?.type === "seconds" ? "seconds" : "reps",
  value: Number(menu?.value) || 0,
  sets: Number(menu?.sets) || 0,
});

const createEmptyPlan = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const sanitizePlan = (rawPlan) => {
  const base = createEmptyPlan();
  if (!rawPlan || typeof rawPlan !== "object") return base;

  return Object.keys(base).reduce((acc, dayKey) => {
    const source = rawPlan[dayKey] ?? rawPlan[Number(dayKey)] ?? { menus: [] };
    const menus = Array.isArray(source.menus) ? source.menus.map(sanitizeMenu) : [];
    return { ...acc, [dayKey]: { menus } };
  }, {});
};

export const getWorkoutSettings = () => sanitizePlan(store.getWorkoutSettings());

export const saveWorkoutSettings = (plan) => store.saveWorkoutSettings(sanitizePlan(plan));

export const getExerciseRecords = (range = {}) => store.listExercises(range);

export const addExerciseRecord = (payload) => {
  if (!payload?.date || !isValidDateString(payload.date)) {
    const error = new Error("日付はYYYY-MM-DD形式で指定してください");
    error.status = 400;
    throw error;
  }

  const calories = Number(payload.calories);
  if (!Number.isFinite(calories) || calories <= 0) {
    const error = new Error("消費カロリーは正の数値で入力してください");
    error.status = 400;
    throw error;
  }

  if (!payload?.type?.trim()) {
    const error = new Error("運動の種類を入力してください");
    error.status = 400;
    throw error;
  }

  const duration = Number(payload.duration);
  if (!Number.isFinite(duration) || duration < 0) {
    const error = new Error("運動時間は0以上の数値で入力してください");
    error.status = 400;
    throw error;
  }

  return store.addExerciseRecord({
    date: payload.date,
    type: payload.type.trim(),
    duration,
    calories,
    memo: payload.memo?.trim() || "",
  });
};

export const getWorkoutSummaryForDate = (date) => {
  const records = store.listExercises({ from: date, to: date });
  const totalCalories = records.reduce((sum, record) => sum + (Number(record.calories) || 0), 0);
  return { date, records, totalCalories };
};
