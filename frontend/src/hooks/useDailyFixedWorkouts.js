import { useEffect, useState } from "react";
import {
  DAILY_FIXED_WORKOUTS_UPDATED_EVENT,
  DEFAULT_DAILY_FIXED_WORKOUTS,
  loadDailyFixedWorkouts,
  saveDailyFixedWorkouts,
} from "../services/dailyFixedWorkoutsStorage.js";

export function useDailyFixedWorkouts() {
  const [dailyFixedWorkouts, setDailyFixedWorkouts] = useState(() => loadDailyFixedWorkouts());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleUpdate = () => setDailyFixedWorkouts(loadDailyFixedWorkouts());

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(DAILY_FIXED_WORKOUTS_UPDATED_EVENT, handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(DAILY_FIXED_WORKOUTS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const updateDailyFixedWorkouts = (nextPlan) => {
    const planToSave = nextPlan ?? DEFAULT_DAILY_FIXED_WORKOUTS;
    setDailyFixedWorkouts(planToSave);
    saveDailyFixedWorkouts(planToSave);
  };

  return { dailyFixedWorkouts, updateDailyFixedWorkouts };
}
