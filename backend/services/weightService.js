import { store, isValidDateString } from "../data/store.js";
import { getMonthKey, getCurrentMonthKey, getPreviousMonthKey, parseDateOrNull } from "../utils/date.js";

// Centralize weight-related calculations that previously lived in the frontend so
// components only ask the API for summaries/trends instead of reimplementing logic.

const sortAsc = (records) => [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

const calculateMonthlyAverage = (records = [], monthKey = getCurrentMonthKey()) => {
  const monthRecords = records.filter((record) => getMonthKey(record.date) === monthKey);
  if (!monthRecords.length) return null;
  const sum = monthRecords.reduce((acc, curr) => acc + Number(curr.weight), 0);
  return +(sum / monthRecords.length).toFixed(1);
};

const calculateMonthOverMonth = (records = []) => {
  const currentKey = getCurrentMonthKey();
  const prevKey = getPreviousMonthKey(currentKey);
  const currentAverage = calculateMonthlyAverage(records, currentKey);
  const previousAverage = calculateMonthlyAverage(records, prevKey);
  const hasCurrent = typeof currentAverage === "number";
  const hasPrev = typeof previousAverage === "number";
  return {
    currentAverage: hasCurrent ? currentAverage : null,
    difference:
      hasCurrent && hasPrev
        ? +(currentAverage - previousAverage).toFixed(1)
        : hasCurrent && !hasPrev
          ? currentAverage
          : null,
  };
};

const buildCalorieMap = (meals = [], exercises = []) => {
  const map = new Map();

  meals.forEach((meal) => {
    const prev = map.get(meal.date) ?? { intakeCalories: 0, burnedCalories: 0 };
    map.set(meal.date, { ...prev, intakeCalories: prev.intakeCalories + (Number(meal.totalCalories) || 0) });
  });

  exercises.forEach((exercise) => {
    const prev = map.get(exercise.date) ?? { intakeCalories: 0, burnedCalories: 0 };
    map.set(exercise.date, { ...prev, burnedCalories: prev.burnedCalories + (Number(exercise.calories) || 0) });
  });

  return map;
};

const normalizeTrendRow = (dateKey, weightByDate, calorieByDate, hasCalorieData) => {
  const calorie = calorieByDate.get(dateKey);
  const weight = weightByDate.get(dateKey);
  return {
    date: dateKey,
    weight: typeof weight === "number" ? weight : null,
    intakeCalories: calorie?.intakeCalories ?? (hasCalorieData ? null : undefined),
    burnedCalories: calorie?.burnedCalories ?? (hasCalorieData ? null : undefined),
  };
};

const createMonthKeys = (latestDate) => {
  return Array.from({ length: 12 }).map((_, index) => {
    const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - (11 - index), 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
};

const calculateCalorieStats = (rows = [], hasCalorieData = false) => {
  if (!hasCalorieData || !rows.length) return { avgIntake: null, avgBurned: null, diff: null };
  const validRows = rows.filter((row) => Number.isFinite(row.intakeCalories) && Number.isFinite(row.burnedCalories));
  if (!validRows.length) return { avgIntake: null, avgBurned: null, diff: null };
  const totals = validRows.reduce(
    (acc, row) => ({ intake: acc.intake + row.intakeCalories, burned: acc.burned + row.burnedCalories }),
    { intake: 0, burned: 0 },
  );
  const avgIntake = Math.round(totals.intake / validRows.length);
  const avgBurned = Math.round(totals.burned / validRows.length);
  return { avgIntake, avgBurned, diff: avgIntake - avgBurned };
};

const getLatestDate = (records, calories) => {
  const dates = [
    ...records.map((record) => parseDateOrNull(record.date)),
    ...calories.map((trend) => parseDateOrNull(trend.date)),
  ].filter(Boolean);
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime())));
};

const dateKeyFromDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeightSummary = () => {
  const records = store.listWeightRecords();
  const sortedDesc = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestRecord = sortedDesc[0] ?? null;
  const previousRecord = sortedDesc[1] ?? null;
  const monthOverMonth = calculateMonthOverMonth(records);

  return {
    currentWeight: latestRecord?.weight ?? null,
    targetWeight: store.getTargetWeight(),
    monthlyAverage: monthOverMonth.currentAverage,
    monthlyDiff: monthOverMonth.difference,
    latestRecord,
    previousRecord,
  };
};

export const getWeightRecords = (range = {}) => store.listWeightRecords(range);

export const addWeightRecord = (payload) => {
  if (!payload?.date || !isValidDateString(payload.date)) {
    const error = new Error("日付はYYYY-MM-DD形式で指定してください");
    error.status = 400;
    throw error;
  }
  const weight = Number(payload.weight);
  if (!Number.isFinite(weight) || weight <= 0 || weight >= 500) {
    const error = new Error("体重は0〜500kgの範囲で入力してください");
    error.status = 400;
    throw error;
  }
  const record = { date: payload.date, weight: weight };
  return store.upsertWeightRecord(record);
};

export const getWeightTrend = (period = "7d") => {
  const weights = sortAsc(store.listWeightRecords());
  const meals = store.listMealRecords();
  const exercises = store.listExercises();
  const calorieMap = buildCalorieMap(meals, exercises);
  const hasCalorieData = calorieMap.size > 0;
  const latestDate = getLatestDate(weights, [...calorieMap.entries()].map(([date, value]) => ({ date, ...value })));
  if (!latestDate) {
    return { period, rows: [], weightStats: { latest: null, diff: null }, calorieStats: { diff: null, avgIntake: null, avgBurned: null } };
  }

  const weightByDate = new Map(weights.map((record) => [record.date, Number(record.weight)]));
  const weightStats = (() => {
    if (!weights.length) return { latest: null, diff: null };
    const startWeight = weights[0]?.weight;
    const endWeight = weights[weights.length - 1]?.weight;
    const diff = Number.isFinite(startWeight) && Number.isFinite(endWeight)
      ? +(endWeight - startWeight).toFixed(1)
      : null;
    return { latest: endWeight ?? null, diff };
  })();

  if (period === "1y") {
    const startMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() - 11, 1);
    const monthlySummary = new Map();

    weights
      .filter((record) => new Date(record.date) >= startMonth)
      .forEach((record) => {
        const key = getMonthKey(record.date);
        const current = monthlySummary.get(key) ?? { weightTotal: 0, weightCount: 0, intake: 0, burned: 0 };
        monthlySummary.set(key, {
          weightTotal: current.weightTotal + record.weight,
          weightCount: current.weightCount + 1,
          intake: current.intake,
          burned: current.burned,
        });
      });

    Array.from(calorieMap.entries())
      .filter(([date]) => new Date(date) >= startMonth)
      .forEach(([date, trend]) => {
        const key = getMonthKey(date);
        const current = monthlySummary.get(key) ?? { weightTotal: 0, weightCount: 0, intake: 0, burned: 0 };
        monthlySummary.set(key, {
          ...current,
          intake: current.intake + (trend.intakeCalories || 0),
          burned: current.burned + (trend.burnedCalories || 0),
        });
      });

    const monthKeys = createMonthKeys(latestDate);
    const rows = monthKeys.map((key) => {
      const summary = monthlySummary.get(key);
      return {
        date: key,
        weight: summary && summary.weightCount ? +(summary.weightTotal / summary.weightCount).toFixed(1) : null,
        intakeCalories: summary?.intake ?? null,
        burnedCalories: summary?.burned ?? null,
      };
    });

    return { period, rows, weightStats, calorieStats: calculateCalorieStats(rows, hasCalorieData) };
  }

  const days = period === "7d" ? 7 : 30;
  const startDate = new Date(latestDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  const calorieByDate = new Map(Array.from(calorieMap.entries()));
  const rows = [];
  for (let cursor = new Date(startDate); cursor <= latestDate; cursor.setDate(cursor.getDate() + 1)) {
    const key = dateKeyFromDate(cursor);
    rows.push(normalizeTrendRow(key, weightByDate, calorieByDate, hasCalorieData));
  }

  return { period, rows, weightStats, calorieStats: calculateCalorieStats(rows, hasCalorieData) };
};
