// src/pages/AddMealPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function AddMealPage() {
  const navigate = useNavigate();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [portion, setPortion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 保存処理を実装（ローカルストレージやAPIなど）
    console.log({ mealName, calories, portion });
    navigate("/");
  };

  return (
    <div className="add-meal-page">
      <div className="add-meal-card">
        <h1 className="add-meal-title">Add a New Meal</h1>

        <form className="add-meal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Meal Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter meal name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Calorie Count</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 380"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Portion Size</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter portion size"
              value={portion}
              onChange={(e) => setPortion(e.target.value)}
            />
          </div>

          <div className="add-meal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              戻る
            </button>
            <button type="submit" className="btn-primary">
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
