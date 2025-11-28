import { useCallback, useEffect, useState } from "react";
import { addMealRecord, getMealRecords } from "../api/meals";

export const useMealEntries = (range = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMealRecords(range);
      setEntries(response.records || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMealEntry = useCallback(
    async (entry) => {
      await addMealRecord(entry);
      await refresh();
    },
    [refresh],
  );

  return {
    mealEntries: entries,
    addMealEntry,
    loading,
    error,
    refresh,
  };
};
