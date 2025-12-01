const createEmptyWeekPlan = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const data = {
  targetWeight: null,
  weights: [],
  meals: [],
  exercises: [],
  workoutSettings: createEmptyWeekPlan(),
  workoutTypes: [],
  workoutCompletionDates: [],
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
    const isSameSlot = (item) =>
      item.date === record.date && (record.timeOfDay ? item.timeOfDay === record.timeOfDay : !item.timeOfDay);

    data.weights = data.weights.filter((item) => !isSameSlot(item));
    const id = record.id ?? Date.now();
    data.weights.push({ ...record, id });
    data.weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    return { ...record, id };
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

  listWorkoutTypes: () => [...data.workoutTypes],
  addWorkoutType: (workoutType) => {
    const id = workoutType.id ?? Date.now().toString();
    const newType = { ...workoutType, id };
    data.workoutTypes.push(newType);
    return newType;
  },
  updateWorkoutType: (id, payload) => {
    const index = data.workoutTypes.findIndex((type) => type.id === id);
    if (index === -1) return null;
    data.workoutTypes[index] = { ...data.workoutTypes[index], ...payload };
    return data.workoutTypes[index];
  },
  deleteWorkoutType: (id) => {
    const before = data.workoutTypes.length;
    data.workoutTypes = data.workoutTypes.filter((type) => type.id !== id);
    return data.workoutTypes.length < before;
  },

  isWorkoutCompletedOn: (date) => data.workoutCompletionDates.includes(date),

  markWorkoutCompleted: (date) => {
    if (!data.workoutCompletionDates.includes(date)) {
      data.workoutCompletionDates.push(date);
    }
    return { date, completed: true };
  },
};

export { isValidDateString };
