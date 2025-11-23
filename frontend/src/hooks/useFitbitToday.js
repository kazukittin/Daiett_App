import { useCallback, useEffect, useState } from "react";
import { fetchFitbitToday } from "../services/fitbitApi.js";

export function useFitbitToday() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFitbitToday();
      setData(response);
    } catch (err) {
      setError(err.message || "Fitbitデータの取得に失敗しました");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
