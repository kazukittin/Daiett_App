const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const startFitbitAuth = () => {
  window.location.href = `${API_BASE}/auth/fitbit`;
};

export const fetchFitbitToday = async () => {
  const response = await fetch(`${API_BASE}/api/fitbit/today`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || "Fitbit data fetch failed";
    const error = new Error(message);
    error.payload = payload;
    throw error;
  }

  return payload;
};
