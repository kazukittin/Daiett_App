const STORAGE_KEY = "calorieProfile";

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse calorie profile from localStorage", error);
    return null;
  }
};

export function getCalorieProfile() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== "object") return null;
  return parsed;
}

export function saveCalorieProfile(profile) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function hasCalorieProfile() {
  return !!getCalorieProfile();
}

export function clearCalorieProfile() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export const CALORIE_PROFILE_STORAGE_KEY = STORAGE_KEY;
