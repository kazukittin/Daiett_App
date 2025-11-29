const MEAL_LABELS = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

export const getMealLabel = (mealType) => MEAL_LABELS[mealType] || "食事";
