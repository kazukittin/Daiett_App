let memoryProfile = null;

export function getCalorieProfile() {
  return memoryProfile;
}

export function saveCalorieProfile(profile) {
  memoryProfile = profile;
}

export function hasCalorieProfile() {
  return !!memoryProfile;
}

export function clearCalorieProfile() {
  memoryProfile = null;
}

export const CALORIE_PROFILE_STORAGE_KEY = "calorieProfile";
