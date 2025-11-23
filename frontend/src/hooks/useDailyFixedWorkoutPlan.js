import { useEffect, useMemo, useState } from "react";
import { getTodayISO, getWeekdayIndexFromISO } from "../utils/date.js";
import {
  DAILY_FIXED_WORKOUTS_UPDATED_EVENT,
  loadDailyFixedWorkouts,
} from "../services/dailyFixedWorkouts.js";

export function useDailyFixedWorkoutPlan(dateISO = getTodayISO()) {
  const [plans, setPlans] = useState(() => loadDailyFixedWorkouts());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleUpdate = () => setPlans(loadDailyFixedWorkouts());

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(DAILY_FIXED_WORKOUTS_UPDATED_EVENT, handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(DAILY_FIXED_WORKOUTS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const weekday = useMemo(() => getWeekdayIndexFromISO(dateISO), [dateISO]);

  const menus = useMemo(() => plans?.[weekday]?.menus ?? [], [plans, weekday]);

  return {
    weekday,
    menus,
    plans,
  };
}
