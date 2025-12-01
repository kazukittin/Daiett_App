import { store } from "./data/store.js";

export async function loadProfile() {
  const profile = store.getUserProfile();
  if (!profile || Object.keys(profile).length === 0) return null;
  return profile;
}

export async function saveProfile(profile) {
  return store.saveUserProfile(profile);
}

export async function clearProfile() {
  store.saveUserProfile({});
}
