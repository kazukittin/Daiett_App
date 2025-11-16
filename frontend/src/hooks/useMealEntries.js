import { useEffect, useState } from "react";
import { getMealEntries, setMealEntries } from "../services/storage";

export const useMealEntries = () => {
  const [entries, setEntries] = useState(() => getMealEntries());

  useEffect(() => {
    setMealEntries(entries);
  }, [entries]);

  const addMealEntry = (entry) => {
    setEntries((prev) => [{ id: Date.now(), ...entry }, ...prev]);
  };

  return {
    mealEntries: entries,
    addMealEntry,
  };
};
