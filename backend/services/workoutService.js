import { store, isValidDateString } from "../data/store.js";
import { listWorkoutTypes } from "./workoutTypeService.js";

// Workout planning, validation, and summaries live here so React components rely on
// the API rather than duplicating business rules in the browser.

const sanitizeMenu = (menu) => ({
  name: menu?.name?.trim() || "",
  type: menu?.type === "seconds" ? "seconds" : "reps",
  value: Number(menu?.value) || 0,
  sets: Number(menu?.sets) || 0,
  expectedCalories: Number.isFinite(Number(menu?.expectedCalories))
    ? Number(menu.expectedCalories)
    : null,
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

const withExpectedCalories = (records = []) => {
  const types = listWorkoutTypes();
  const byId = new Map(types.map((type) => [type.id, type]));
  const byName = new Map(types.map((type) => [type.name, type]));

  return records.map((record) => {
    const matchedType =
      (record.workoutTypeId && byId.get(record.workoutTypeId)) || byName.get(record.type);
    const expectedCalories = matchedType?.expectedCalories;
    return {
      ...record,
      expectedCalories: Number.isFinite(expectedCalories) ? Number(expectedCalories) : null,
    };
  });
};

export const getExerciseRecords = (range = {}) => withExpectedCalories(store.listExercises(range));

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
    workoutTypeId: payload.workoutTypeId,
    meta: payload.meta,
  });
};

export const removeExerciseRecord = (id) => {
  if (!id) {
    const error = new Error("削除する運動記録のIDを指定してください");
    error.status = 400;
    throw error;
  }

  const deleted = store.deleteExerciseRecord(Number(id));
  if (!deleted) {
    const error = new Error("指定された運動記録が見つかりません");
    error.status = 404;
    throw error;
  }
};

export const getWorkoutSummaryForDate = (date) => {
  const records = getExerciseRecords({ from: date, to: date });
  const totalCalories = records.reduce((sum, record) => sum + (Number(record.calories) || 0), 0);
  return { date, records, totalCalories };
};

const getTodayISO = () => new Date().toISOString().split("T")[0];

export const getTodayWorkoutStatus = () => {
  const today = getTodayISO();
  const completed = store.isWorkoutCompletedOn(today);
  return { date: today, completed };
};

export const markTodayWorkoutComplete = () => {
  const today = getTodayISO();
  return store.markWorkoutCompleted(today);
};

export const unmarkTodayWorkoutComplete = () => {
  const today = getTodayISO();
  return store.unmarkWorkoutCompleted(today);
};
