export const getMonthKey = (isoString) => isoString?.slice(0, 7) ?? "";

export const getCurrentMonthKey = () => getMonthKey(new Date().toISOString());

export const getPreviousMonthKey = (currentMonthKey) => {
  if (!currentMonthKey) return "";
  const [year, month] = currentMonthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const parseDateOrNull = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
