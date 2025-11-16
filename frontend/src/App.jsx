// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeDashboardPage from "./pages/HomeDashboardPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx"; // 摂取カロリー
import BurnDashboardPage from "./pages/BurnDashboardPage.jsx";
import AddMealPage from "./pages/AddMealPage.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardPage />} />
      <Route path="/intake" element={<DashboardPage />} />
      <Route path="/burn" element={<BurnDashboardPage />} />
      <Route path="/meals/new" element={<AddMealPage />} />
    </Routes>
  );
}
