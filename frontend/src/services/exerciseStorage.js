const STORAGE_KEY = "exercises";
export const EXERCISES_UPDATED_EVENT = "exercisesUpdated";

const hasWindow = typeof window !== "undefined";

export function loadExercises() {
  if (!hasWindow) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load exercises from storage", error);
    return [];
  }
}

export function saveExercises(exercises) {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    window.dispatchEvent(new Event(EXERCISES_UPDATED_EVENT));
  } catch (error) {
    console.error("Failed to save exercises to storage", error);
  }
}

export function appendExercise(record) {
  const nextRecords = [...loadExercises(), record];
  saveExercises(nextRecords);
  return nextRecords;
}
