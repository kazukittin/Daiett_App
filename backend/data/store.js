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
    targetIntakeCalories: null,
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
  dailyBurned: [],
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

const withinRange = (dateStr, from, to) => {
  const date = new Date(dateStr);
  if (from && date < new Date(from)) return false;
  if (to && date > new Date(to)) return false;
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
};

export { isValidDateString };
