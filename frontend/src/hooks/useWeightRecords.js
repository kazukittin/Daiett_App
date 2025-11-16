import { useEffect, useMemo, useState } from "react";
import { getWeightRecords, setWeightRecords } from "../services/storage";
import { sortWeightRecords } from "../utils/weight";

export const TARGET_WEIGHT = 60;

export const useWeightRecords = () => {
  const [records, setRecords] = useState(() => sortWeightRecords(getWeightRecords()));

  useEffect(() => {
    setWeightRecords(records);
  }, [records]);

  const addWeightRecord = ({ date, weight }) => {
    if (!date) return;
    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight)) return;

    setRecords((prev) => {
      const filtered = prev.filter((record) => record.date !== date);
      return sortWeightRecords([...filtered, { date, weight: numericWeight }]);
    });
  };

  const memoized = useMemo(() => ({
    latestRecord: records[0],
    previousRecord: records[1],
  }), [records]);

  return {
    weightRecords: records,
    addWeightRecord,
    latestRecord: memoized.latestRecord,
    previousRecord: memoized.previousRecord,
    targetWeight: TARGET_WEIGHT,
  };
};
