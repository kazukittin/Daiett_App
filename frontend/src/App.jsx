// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeDashboardPage from "./pages/HomeDashboardPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx"; // いまの摂取カロリー画面
import AddMealPage from "./pages/AddMealPage.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboardPage />} />
      <Route path="/intake" element={<DashboardPage />} />
      <Route path="/meals/new" element={<AddMealPage />} />
    </Routes>
  );
}
