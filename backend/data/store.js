const createEmptyWeekPlan = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const data = {
  targetWeight: null,
  weights: [],
  meals: [],
  exercises: [],
  workoutSettings: createEmptyWeekPlan(),
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

export const store = {
  getTargetWeight: () => data.targetWeight,

  listWeightRecords: (range = {}) =>
    data.weights
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),

  upsertWeightRecord: (record) => {
    data.weights = data.weights.filter((item) => item.date !== record.date);
    data.weights.push(record);
    data.weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    return record;
  },

  listMealRecords: (range = {}) =>
    data.meals
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),

  addMealRecord: (record) => {
    const id = Date.now();
    const newRecord = { ...record, id };
    data.meals.unshift(newRecord);
    return newRecord;
  },

  listExercises: (range = {}) =>
    data.exercises
      .filter((record) => withinRange(record.date, range.from, range.to))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),

  addExerciseRecord: (record) => {
    const id = Date.now();
    const newRecord = { ...record, id };
    data.exercises.push(newRecord);
    return newRecord;
  },

  getWorkoutSettings: () => data.workoutSettings,
  saveWorkoutSettings: (settings) => {
    data.workoutSettings = settings;
    return settings;
  },
};

export { isValidDateString };
