import { useEffect, useMemo, useState } from "react";
import { getTodayISO } from "../utils/date.js";
import { EXERCISES_UPDATED_EVENT, loadExercises } from "../services/exerciseStorage.js";

export function useTodayExercises() {
  const todayKey = getTodayISO();
  const [records, setRecords] = useState(() => loadExercises());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleUpdate = () => setRecords(loadExercises());

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(EXERCISES_UPDATED_EVENT, handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(EXERCISES_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const todayExercises = useMemo(() => records.filter((record) => record.date === todayKey), [records, todayKey]);

  const totalCalories = useMemo(
    () => todayExercises.reduce((total, exercise) => total + (Number(exercise.calories) || 0), 0),
    [todayExercises],
  );

  return { todayExercises, totalCalories };
}
