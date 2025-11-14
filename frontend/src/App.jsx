// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddMealPage from "./pages/AddMealPage.jsx";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/meals/new" element={<AddMealPage />} />
    </Routes>
  );
}
