import { useEffect, useState } from "react";
import { getWeightTrend } from "../api/weight";

export function useWeightTrend(initialPeriod = "7d") {
  const [period, setPeriod] = useState(initialPeriod);
  const [trend, setTrend] = useState({ rows: [], weightStats: {}, calorieStats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWeightTrend({ period })
      .then((data) => {
        if (cancelled) return;
        setTrend(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return { period, setPeriod, trend, loading, error };
}
