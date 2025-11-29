import { useCallback, useEffect, useMemo, useState } from "react";
import { addWeightRecord as addWeightRecordApi, getWeightRecords, getWeightSummary } from "../api/weight";

export const TARGET_WEIGHT = null;

export const useWeightRecords = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ latestRecord: null, previousRecord: null, targetWeight: TARGET_WEIGHT });

  const refresh = useCallback(async () => {
    const [recordsResponse, summaryResponse] = await Promise.all([
      getWeightRecords(),
      getWeightSummary(),
    ]);

    setRecords(recordsResponse.records || []);
    setSummary(summaryResponse);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWeightRecord = useCallback(
    async ({ date, weight }) => {
      await addWeightRecordApi({ date, weight });
      await refresh();
    },
    [refresh],
  );

  const memoized = useMemo(
    () => ({
      latestRecord: summary?.latestRecord ?? null,
      previousRecord: summary?.previousRecord ?? null,
    }),
    [summary],
  );

  return {
    weightRecords: records,
    addWeightRecord,
    latestRecord: memoized.latestRecord,
    previousRecord: memoized.previousRecord,
    targetWeight: summary?.targetWeight ?? TARGET_WEIGHT,
    monthlyAverage: summary?.monthlyAverage ?? null,
    monthlyDiff: summary?.monthlyDiff ?? null,
    refresh,
  };
};
