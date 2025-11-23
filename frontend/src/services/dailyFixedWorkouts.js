const STORAGE_KEY = "dailyFixedWorkouts";
export const DAILY_FIXED_WORKOUTS_UPDATED_EVENT = "dailyFixedWorkoutsUpdated";

const hasWindow = typeof window !== "undefined";

const createEmptyWeek = () =>
  Array.from({ length: 7 }).reduce((acc, _, index) => ({ ...acc, [index]: { menus: [] } }), {});

const normalizeMenu = (menu) => ({
  name: menu?.name ?? "",
  type: menu?.type === "seconds" ? "seconds" : "reps",
  value: Number(menu?.value) || 0,
  sets: Number(menu?.sets) || 0,
});

const sanitizePlan = (rawPlan) => {
  const base = createEmptyWeek();
  if (!rawPlan || typeof rawPlan !== "object") return base;

  return Object.keys(base).reduce((acc, dayKey) => {
    const source = rawPlan[dayKey] ?? rawPlan[Number(dayKey)] ?? { menus: [] };
    const menus = Array.isArray(source.menus) ? source.menus.map(normalizeMenu) : [];
    return { ...acc, [dayKey]: { menus } };
  }, {});
};

export function loadDailyFixedWorkouts() {
  if (!hasWindow) return createEmptyWeek();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : createEmptyWeek();
    return sanitizePlan(parsed);
  } catch (error) {
    console.error("Failed to load daily fixed workouts", error);
    return createEmptyWeek();
  }
}

export function saveDailyFixedWorkouts(plan) {
  if (!hasWindow) return;
  try {
    const normalized = sanitizePlan(plan);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(DAILY_FIXED_WORKOUTS_UPDATED_EVENT));
    window.dispatchEvent(new Event("storage"));
    return normalized;
  } catch (error) {
    console.error("Failed to save daily fixed workouts", error);
    return undefined;
  }
}

export function getPlanForWeekday(weekday, plan = undefined) {
  const source = plan ?? (hasWindow ? loadDailyFixedWorkouts() : createEmptyWeek());
  return source?.[weekday]?.menus ?? [];
}
