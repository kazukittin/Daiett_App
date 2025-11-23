const STORAGE_KEY = "dailyFixedWorkouts";
export const DAILY_FIXED_WORKOUTS_UPDATED_EVENT = "dailyFixedWorkoutsUpdated";

const hasWindow = typeof window !== "undefined";

const createEmptyWeekPlan = () => ({
  0: { menus: [] },
  1: { menus: [] },
  2: { menus: [] },
  3: { menus: [] },
  4: { menus: [] },
  5: { menus: [] },
  6: { menus: [] },
});

export const DEFAULT_DAILY_FIXED_WORKOUTS = createEmptyWeekPlan();

export const WEEKDAY_LABELS = [
  { value: 1, label: "月曜日", short: "Mon" },
  { value: 2, label: "火曜日", short: "Tue" },
  { value: 3, label: "水曜日", short: "Wed" },
  { value: 4, label: "木曜日", short: "Thu" },
  { value: 5, label: "金曜日", short: "Fri" },
  { value: 6, label: "土曜日", short: "Sat" },
  { value: 0, label: "日曜日", short: "Sun" },
];

const toNumberOrNull = (input) => {
  if (input === null || input === undefined || input === "") return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMenu = (menu) => {
  if (typeof menu === "string") {
    const trimmed = menu.trim();
    return trimmed ? { name: trimmed, type: "reps", value: null, sets: null } : null;
  }

  if (!menu || typeof menu !== "object") return null;

  const name = typeof menu.name === "string" ? menu.name.trim() : "";
  const reps = toNumberOrNull(menu.reps);
  const seconds = toNumberOrNull(menu.seconds);
  let type = menu.type === "seconds" ? "seconds" : "reps";

  if (!menu.type && seconds !== null && reps === null) {
    type = "seconds";
  }

  const fallbackValue = type === "seconds" ? seconds ?? null : reps ?? seconds ?? null;

  const value = toNumberOrNull(menu.value);
  const sets = toNumberOrNull(menu.sets);

  const finalValue = value ?? fallbackValue;

  if (!name && finalValue === null && sets === null) return null;

  return {
    name,
    type,
    value: finalValue,
    sets,
  };
};

const normalizeDay = (value) => {
  if (!value || typeof value !== "object") return { menus: [] };

  if (Array.isArray(value.menus)) {
    const menus = value.menus
      .map(normalizeMenu)
      .filter(Boolean);
    return { menus };
  }

  if (typeof value.name === "string") {
    const maybeMenu = normalizeMenu({ name: value.name });
    return { menus: maybeMenu ? [maybeMenu] : [] };
  }

  if (value.rest) return { menus: [] };

  return { menus: [] };
};

const normalizePlan = (plan) => {
  const normalized = createEmptyWeekPlan();

  if (!plan || typeof plan !== "object") return normalized;

  Object.entries(plan).forEach(([key, value]) => {
    const weekday = Number(key);
    if (Number.isNaN(weekday)) return;

    normalized[weekday] = normalizeDay(value);
  });

  return normalized;
};

export function loadDailyFixedWorkouts() {
  if (!hasWindow) return createEmptyWeekPlan();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyWeekPlan();

    const parsed = JSON.parse(raw);
    return normalizePlan(parsed);
  } catch (error) {
    console.error("Failed to load daily fixed workouts from storage", error);
    return createEmptyWeekPlan();
  }
}

export function saveDailyFixedWorkouts(plan) {
  if (!hasWindow) return;

  try {
    const normalized = normalizePlan(plan);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(DAILY_FIXED_WORKOUTS_UPDATED_EVENT));
  } catch (error) {
    console.error("Failed to save daily fixed workouts", error);
  }
}

export function getFixedWorkoutForDate(plan, isoString) {
  const normalized = normalizePlan(plan);
  const targetDate = isoString ? new Date(isoString) : new Date();
  const weekday = targetDate.getDay();
  return normalized[weekday];
}

export function getFixedWorkoutForWeekday(plan, weekday) {
  return normalizePlan(plan)[weekday];
}
