import { apiClient } from "./client";

export const getWorkoutSettings = () => apiClient.get("/api/workouts/settings");
export const saveWorkoutSettings = (payload) => apiClient.post("/api/workouts/settings", payload);

export const getWorkoutSummary = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/workouts/summary${search ? `?${search}` : ""}`);
};

export const getWorkoutRecords = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return apiClient.get(`/api/workouts/records${search ? `?${search}` : ""}`);
};

export const addWorkoutRecord = (payload) => apiClient.post("/api/workouts/records", payload);

export const getWorkoutTypes = () => apiClient.get("/api/workouts/types");
export const createWorkoutType = (payload) => apiClient.post("/api/workouts/types", payload);
export const updateWorkoutType = (id, payload) => apiClient.put(`/api/workouts/types/${id}`, payload);
export const deleteWorkoutType = (id) => apiClient.delete(`/api/workouts/types/${id}`);

export const getTodayWorkoutStatus = () => apiClient.get("/api/workouts/today/status");
export const completeTodayWorkout = () => apiClient.post("/api/workouts/today/complete");
