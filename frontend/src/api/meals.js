import { apiClient } from "./client";

export const getMealSummary = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/meals/summary${search ? `?${search}` : ""}`);
};

export const getMealRecords = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/meals/records${search ? `?${search}` : ""}`);
};

export const addMealRecord = (payload) => apiClient.post("/api/meals/records", payload);
