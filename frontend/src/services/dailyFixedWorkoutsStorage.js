const STORAGE_KEY = "dailyFixedWorkouts";
export const DAILY_FIXED_WORKOUTS_UPDATED_EVENT = "dailyFixedWorkoutsUpdated";

const hasWindow = typeof window !== "undefined";

export const DEFAULT_DAILY_FIXED_WORKOUTS = {
  0: { name: "Rest", rest: true },
  1: { name: "", rest: false },
  2: { name: "", rest: false },
  3: { name: "", rest: false },
  4: { name: "", rest: false },
  5: { name: "", rest: false },
  6: { name: "", rest: false },
};

export const WEEKDAY_LABELS = [
  { value: 1, label: "月曜日", short: "Mon" },
  { value: 2, label: "火曜日", short: "Tue" },
  { value: 3, label: "水曜日", short: "Wed" },
  { value: 4, label: "木曜日", short: "Thu" },
  { value: 5, label: "金曜日", short: "Fri" },
  { value: 6, label: "土曜日", short: "Sat" },
  { value: 0, label: "日曜日", short: "Sun" },
];

const normalizePlan = (plan) => {
  const normalized = { ...DEFAULT_DAILY_FIXED_WORKOUTS };

  if (!plan || typeof plan !== "object") return normalized;

  Object.entries(plan).forEach(([key, value]) => {
    const weekday = Number(key);
    if (Number.isNaN(weekday)) return;

    normalized[weekday] = {
      name: value?.name ?? "",
      rest: Boolean(value?.rest),
    };
  });

  return normalized;
};

export function loadDailyFixedWorkouts() {
  if (!hasWindow) return { ...DEFAULT_DAILY_FIXED_WORKOUTS };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DAILY_FIXED_WORKOUTS };

    const parsed = JSON.parse(raw);
    return normalizePlan(parsed);
  } catch (error) {
    console.error("Failed to load daily fixed workouts from storage", error);
    return { ...DEFAULT_DAILY_FIXED_WORKOUTS };
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
