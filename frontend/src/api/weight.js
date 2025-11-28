import { apiClient } from "./client";

export const getWeightSummary = () => apiClient.get("/api/weight/summary");

export const getWeightRecords = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/weight/records${search ? `?${search}` : ""}`);
};

export const addWeightRecord = (payload) => apiClient.post("/api/weight/records", payload);

export const getWeightTrend = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/weight/trend${search ? `?${search}` : ""}`);
};
