import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, "persistentStore.json");

const createEmptyWeekPlan = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const defaultData = {
  user: {
    id: "default",
    nickname: "",
    email: "",
    heightCm: null,
    weight: null,
    age: null,
    birthdate: null,
    sex: null,
    activityLevel: null,
    goal: null,
    targetWeight: null,
    targetBurnCalories: null,
    unit: "kg",
    theme: "light",
  },
  weights: [],
  meals: [],
  exercises: [],
  workoutSettings: createEmptyWeekPlan(),
  workoutTypes: [],
  workoutCompletionDates: [],
  foodSets: [],
  foodMaster: [],
  fitbitActivities: [],
  fitbitActivities: [],
  dailyBurned: [],
  water: [],
};

const loadData = () => {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch (error) {
    return { ...defaultData };
  }
};

let data = loadData();

const persist = () => {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
};

const isValidDateString = (value) => {
  if (!value || typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const isPlainDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const toDate = (value, { endOfDay = false } = {}) => {
  if (!value) return null;
  if (value instanceof Date) return new Date(value.getTime());

  if (typeof value === "object" && typeof value.seconds === "number") {
    const millis = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1_000_000);
    return new Date(millis);
  }

  const parsed = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  if (isPlainDate(value)) {
    const hours = endOfDay ? 23 : 0;
    const minutes = endOfDay ? 59 : 0;
    parsed.setHours(hours, minutes, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  }

  return parsed;
};

const withinRange = (dateStr, from, to) => {
  const date = toDate(dateStr);
  if (!date) return false;

  const fromDate = from ? toDate(from) : null;
  const toDateValue = to ? toDate(to, { endOfDay: true }) : null;

  if (fromDate && date < fromDate) return false;
  if (toDateValue && date > toDateValue) return false;
  return true;
};

const nextId = () => Date.now();

export const store = {
  getUserProfile: () => ({ ...data.user }),
  saveUserProfile: (profile) => {
    data.user = { ...data.user, ...profile };
    persist();
    return { ...data.user };
  },

  getTargetWeight: () => data.user.targetWeight,

  listWeightRecords: (range = {}) =>
    data.weights
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),

  upsertWeightRecord: (record) => {
    const isSameSlot = (item) =>
      item.date === record.date && (record.timeOfDay ? item.timeOfDay === record.timeOfDay : !item.timeOfDay);

    data.weights = data.weights.filter((item) => !isSameSlot(item));
    const id = record.id ?? nextId();
    const newRecord = { ...record, id };
    data.weights.push(newRecord);
    data.weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    persist();
    return newRecord;
  },

  listMealRecords: (range = {}) =>
    data.meals
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),

  addMealRecord: (record) => {
    const id = nextId();
    const newRecord = { ...record, id };
    data.meals.unshift(newRecord);
    persist();
    return newRecord;
  },

  updateMealRecord: (id, payload) => {
    const index = data.meals.findIndex((meal) => meal.id === id);
    if (index === -1) return null;

    const updated = { ...data.meals[index], ...payload, id };
    data.meals[index] = updated;
    persist();
    return updated;
  },

  deleteMealRecord: (id) => {
    const before = data.meals.length;
    data.meals = data.meals.filter((meal) => meal.id !== id);
    const deleted = data.meals.length !== before;
    if (deleted) {
      persist();
    }
    return deleted;
  },

  listExercises: (range = {}) =>
    data.exercises
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),

  addExerciseRecord: (record) => {
    const id = nextId();
    const newRecord = { ...record, id };
    data.exercises.push(newRecord);
    persist();
    return newRecord;
  },

  deleteExerciseRecord: (id) => {
    const initialLength = data.exercises.length;
    data.exercises = data.exercises.filter((record) => record.id !== id);
    const deleted = data.exercises.length < initialLength;
    if (deleted) {
      persist();
    }
    return deleted;
  },

  getWorkoutSettings: () => data.workoutSettings,
  saveWorkoutSettings: (settings) => {
    data.workoutSettings = settings;
    persist();
    return settings;
  },

  listWorkoutTypes: () => [...data.workoutTypes],
  addWorkoutType: (workoutType) => {
    const id = workoutType.id ?? nextId().toString();
    const newType = { ...workoutType, id };
    data.workoutTypes.push(newType);
    persist();
    return newType;
  },
  updateWorkoutType: (id, payload) => {
    const index = data.workoutTypes.findIndex((type) => type.id === id);
    if (index === -1) return null;
    data.workoutTypes[index] = { ...data.workoutTypes[index], ...payload };
    persist();
    return data.workoutTypes[index];
  },
  deleteWorkoutType: (id) => {
    const before = data.workoutTypes.length;
    data.workoutTypes = data.workoutTypes.filter((type) => type.id !== id);
    persist();
    return data.workoutTypes.length < before;
  },

  isWorkoutCompletedOn: (date) => data.workoutCompletionDates.includes(date),

  markWorkoutCompleted: (date) => {
    if (!data.workoutCompletionDates.includes(date)) {
      data.workoutCompletionDates.push(date);
      persist();
    }
    return { date, completed: true };
  },

  unmarkWorkoutCompleted: (date) => {
    const before = data.workoutCompletionDates.length;
    data.workoutCompletionDates = data.workoutCompletionDates.filter((value) => value !== date);
    if (data.workoutCompletionDates.length !== before) {
      persist();
    }
    return { date, completed: false };
  },

  listFoodSets: () => [...data.foodSets],
  addFoodSet: (foodSet) => {
    const id = foodSet.id ?? `fs_${nextId().toString(36)}`;
    const created = { ...foodSet, id, createdAt: new Date().toISOString() };
    data.foodSets.push(created);
    persist();
    return created;
  },
  updateFoodSet: (id, payload) => {
    const index = data.foodSets.findIndex((item) => item.id === id);
    if (index === -1) return null;
    data.foodSets[index] = { ...data.foodSets[index], ...payload, id };
    persist();
    return data.foodSets[index];
  },
  deleteFoodSet: (id) => {
    data.foodSets = data.foodSets.filter((item) => item.id !== id);
    persist();
  },

  listFoodMaster: () => [...data.foodMaster],
  addFoodMaster: (payload) => {
    const id = payload.id ?? `food_${nextId().toString(36)}`;
    const now = new Date().toISOString();
    const record = { ...payload, id, createdAt: now, updatedAt: now };
    data.foodMaster.push(record);
    persist();
    return record;
  },
  updateFoodMaster: (id, payload) => {
    const index = data.foodMaster.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    data.foodMaster[index] = { ...data.foodMaster[index], ...payload, updatedAt: now };
    persist();
    return data.foodMaster[index];
  },
  deleteFoodMaster: (id) => {
    data.foodMaster = data.foodMaster.filter((item) => item.id !== id);
    persist();
  },

  listWaterRecords: (range = {}) =>
    data.water
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),

  addWaterRecord: (record) => {
    const id = record.id ?? `water_${nextId().toString(36)}`;
    const newRecord = { ...record, id };
    data.water.push(newRecord);
    persist();
    return newRecord;
  },

  deleteWaterRecord: (id) => {
    const initialLength = data.water.length;
    data.water = data.water.filter((record) => record.id !== id);
    const deleted = data.water.length < initialLength;
    if (deleted) {
      persist();
    }
    return deleted;
  },
};

export { isValidDateString };
