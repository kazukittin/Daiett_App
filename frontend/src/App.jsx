// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeDashboard from "./screens/Home/HomeDashboard.jsx";
import IntakeDashboard from "./screens/Intake/IntakeDashboard.jsx";
import BurnDashboard from "./screens/Burn/BurnDashboard.jsx";
import AddMeal from "./screens/Meals/AddMeal.jsx";
import AddExercise from "./screens/Exercises/AddExercise.jsx";
import DailyFixedWorkoutSettings from "./screens/Workouts/DailyFixedWorkoutSettings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboard />} />
      <Route path="/intake" element={<IntakeDashboard />} />
      <Route path="/burn" element={<BurnDashboard />} />
      <Route path="/meals/new" element={<AddMeal />} />
      <Route path="/exercises/new" element={<AddExercise />} />
      <Route path="/workouts/settings" element={<DailyFixedWorkoutSettings />} />
    </Routes>
  );
}
