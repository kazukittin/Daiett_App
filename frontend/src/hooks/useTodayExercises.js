import { useEffect, useState } from "react";
import { getTodayISO } from "../utils/date.js";
import { addWorkoutRecord, deleteWorkoutRecord, getWorkoutSummary } from "../api/workouts";

export function useTodayExercises() {
  const todayKey = getTodayISO();
  const [summary, setSummary] = useState({ records: [], totalCalories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await getWorkoutSummary({ date: todayKey });
      setSummary(response);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const addExercise = async (payload) => {
    await addWorkoutRecord(payload);
    await refresh();
  };

  const removeExercise = async (id) => {
    await deleteWorkoutRecord(id);
    await refresh();
  };

  return {
    todayExercises: summary.records,
    totalCalories: summary.totalCalories,
    loading,
    error,
    refresh,
    addExercise,
    removeExercise,
  };
}
