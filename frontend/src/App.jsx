// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeDashboard from "./screens/Home/HomeDashboard.jsx";
import IntakeDashboard from "./screens/Intake/IntakeDashboard.jsx";
import BurnDashboard from "./screens/Burn/BurnDashboard.jsx";
import AddMeal from "./screens/Meals/AddMeal.jsx";
import MealHistory from "./screens/Meals/MealHistory.jsx";
import ExerciseHistory from "./screens/Exercises/ExerciseHistory.jsx";
import AddExercise from "./screens/Exercises/AddExercise.jsx";
import AddWeight from "./screens/Weight/AddWeight.jsx";
import WorkoutSettings from "./screens/Settings/WorkoutSettings.jsx";
import CalorieAdvisor from "./components/CalorieAdvisor.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboard />} />
      <Route path="/intake" element={<IntakeDashboard />} />
      <Route path="/burn" element={<BurnDashboard />} />
      <Route path="/meals/new" element={<AddMeal />} />
      <Route path="/meals/history" element={<MealHistory />} />
      <Route path="/exercises/history" element={<ExerciseHistory />} />
      <Route path="/weight/new" element={<AddWeight />} />
      <Route path="/exercises/new" element={<AddExercise />} />
      <Route path="/settings/workouts" element={<WorkoutSettings />} />
      <Route path="/calories" element={<CalorieAdvisor />} />
    </Routes>
  );
}
