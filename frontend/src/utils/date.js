export const getTodayISO = () => {
  const today = new Date();
  const iso = today.toISOString().split("T")[0];
  return iso;
};

export const formatJapaneseDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
};

export const getMonthKey = (isoString) => isoString?.slice(0, 7) ?? "";

export const getCurrentMonthKey = () => getMonthKey(getTodayISO());

export const getPreviousMonthKey = (currentMonthKey) => {
  if (!currentMonthKey) return "";
  const [year, month] = currentMonthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getWeekdayIndexFromISO = (isoString) => {
  if (!isoString) return new Date().getDay();
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
};

export const weekdayLabels = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];
