const BASE_URL = "";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Fitbit API error");
  }
  return response.json();
};

export const fetchFitbitStatus = async () => {
  const response = await fetch(`${BASE_URL}/api/fitbit/status`);
  return handleResponse(response);
};

export const fetchFitbitToday = async () => {
  const response = await fetch(`${BASE_URL}/api/fitbit/today`);
  return handleResponse(response);
};

export const startFitbitAuth = () => {
  window.location.href = `${BASE_URL}/auth/fitbit`;
};
