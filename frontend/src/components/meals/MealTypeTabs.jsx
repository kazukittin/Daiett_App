import React from "react";

const MEAL_LABELS = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

const MealTypeTabs = ({ value, onChange }) => {
  return (
    <div className="meal-tabs">
      {Object.entries(MEAL_LABELS).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`meal-tab ${value === key ? "active" : ""}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default MealTypeTabs;
