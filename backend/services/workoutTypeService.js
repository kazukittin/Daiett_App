import { store } from "../data/store.js";

const toNumberOrNull = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const listWorkoutTypes = () => store.listWorkoutTypes();

export const createWorkoutType = (payload = {}) => {
  const name = payload?.name?.trim();
  if (!name) {
    const error = new Error("ワークアウト名は必須です");
    error.status = 400;
    throw error;
  }

  const expectedCalories = toNumberOrNull(payload.expectedCalories);
  const newType = store.addWorkoutType({ name, expectedCalories });
  return newType;
};

export const updateWorkoutType = (id, payload = {}) => {
  if (!id) {
    const error = new Error("IDが指定されていません");
    error.status = 400;
    throw error;
  }

  const updates = {};
  if (typeof payload.name === "string") {
    const trimmed = payload.name.trim();
    if (!trimmed) {
      const error = new Error("ワークアウト名は必須です");
      error.status = 400;
      throw error;
    }
    updates.name = trimmed;
  }

  if (payload.expectedCalories !== undefined) {
    updates.expectedCalories = toNumberOrNull(payload.expectedCalories);
  }

  const updated = store.updateWorkoutType(id, updates);
  if (!updated) {
    const error = new Error("指定されたワークアウトタイプが見つかりません");
    error.status = 404;
    throw error;
  }
  return updated;
};

export const deleteWorkoutType = (id) => {
  if (!id) {
    const error = new Error("IDが指定されていません");
    error.status = 400;
    throw error;
  }
  const removed = store.deleteWorkoutType(id);
  if (!removed) {
    const error = new Error("指定されたワークアウトタイプが見つかりません");
    error.status = 404;
    throw error;
  }
};
