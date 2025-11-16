const STORAGE_KEYS = {
  weights: "daiett_weight_records",
  meals: "daiett_meal_entries",
};

const defaultWeights = [
  { date: "2024-01-08", weight: 63.2 },
  { date: "2024-01-09", weight: 63.4 },
  { date: "2024-01-10", weight: 63.0 },
  { date: "2024-01-11", weight: 62.9 },
];

const defaultMeals = [];

const readFromStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("Failed to parse storage", error);
    return fallback;
  }
};

const writeToStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to write storage", error);
  }
};

export const getWeightRecords = () => readFromStorage(STORAGE_KEYS.weights, defaultWeights);

export const setWeightRecords = (records) => writeToStorage(STORAGE_KEYS.weights, records);

export const getMealEntries = () => readFromStorage(STORAGE_KEYS.meals, defaultMeals);

export const setMealEntries = (entries) => writeToStorage(STORAGE_KEYS.meals, entries);

