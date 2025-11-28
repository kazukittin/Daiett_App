import { useEffect, useMemo, useState } from "react";
import { getTodayISO, getWeekdayIndexFromISO } from "../utils/date.js";
import { getWorkoutSettings } from "../api/workouts";

export function useDailyFixedWorkoutPlan(dateISO = getTodayISO()) {
  const [plans, setPlans] = useState(() => ({}));

  useEffect(() => {
    let cancelled = false;
    getWorkoutSettings()
      .then((data) => {
        if (!cancelled) setPlans(data);
      })
      .catch((error) => console.error("Failed to load workout settings", error));

    return () => {
      cancelled = true;
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
