const createEmptyWeekPlan = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const data = {
  targetWeight: 60,
  weights: [
    { date: "2024-01-08", weight: 63.2 },
    { date: "2024-01-09", weight: 63.4 },
    { date: "2024-01-10", weight: 63.0 },
    { date: "2024-01-11", weight: 62.9 },
  ],
  meals: [
    {
      id: 1,
      mealType: "breakfast",
      date: "2024-01-11",
      memo: "野菜多め",
      foods: [
        { name: "ごはん", portion: "150g", calories: 252 },
        { name: "味噌汁", portion: "1杯", calories: 80 },
      ],
      totalCalories: 332,
    },
  ],
  exercises: [
    { id: 1, date: "2024-01-11", type: "ウォーキング", duration: 30, calories: 150 },
  ],
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
