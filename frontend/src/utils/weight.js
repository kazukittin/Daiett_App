import { getMonthKey, getCurrentMonthKey, getPreviousMonthKey } from "./date";

export const sortWeightRecords = (records = []) =>
  [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

export const getLatestRecord = (records = []) => sortWeightRecords(records)[0];

export const getPreviousRecord = (records = []) => sortWeightRecords(records)[1];

export const calculateDifference = (records = []) => {
  const [latest, previous] = sortWeightRecords(records);
  if (!latest || !previous) return 0;
  return Number(latest.weight) - Number(previous.weight);
};

export const calculateMonthlyAverage = (records = [], monthKey = getCurrentMonthKey()) => {
  const monthRecords = records.filter((record) => getMonthKey(record.date) === monthKey);
  if (!monthRecords.length) return 0;
  const sum = monthRecords.reduce((acc, curr) => acc + Number(curr.weight), 0);
  return +(sum / monthRecords.length).toFixed(1);
};

export const calculateMonthOverMonth = (records = []) => {
  const currentKey = getCurrentMonthKey();
  const prevKey = getPreviousMonthKey(currentKey);
  const currentAverage = calculateMonthlyAverage(records, currentKey);
  const previousAverage = calculateMonthlyAverage(records, prevKey);
  return {
    currentAverage,
    difference: +(currentAverage - previousAverage).toFixed(1),
  };
};

export const isValidWeight = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed < 500;
};
