import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";

const MEAL_LABELS = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

const getMealLabel = (mealType) => MEAL_LABELS[mealType] || "食事";

const getMealTitle = (meal) => {
  const foodNames = meal.foods?.map((food) => food.name).filter(Boolean) || [];
  if (foodNames.length > 0) {
    return foodNames.slice(0, 3).join("、");
  }
  if (meal.memo?.trim()) {
    return meal.memo.trim();
  }
  return "内容は未入力";
};

export default function TodayMealHighlight({ meals, totalCalories }) {
  const navigate = useNavigate();
  const latestMeals = useMemo(() => meals.slice(0, 5), [meals]);

  return (
    <Card
      title="今日の食事ハイライト"
      action={
        <div className="meal-highlight-actions">
          <Button variant="ghost" onClick={() => navigate("/intake")}>
            食事履歴をもっと見る
          </Button>
          <Button onClick={() => navigate("/meals/new")}>🍙 食事を追加</Button>
        </div>
      }
    >
      <div className="meal-highlight-summary">
        <span>
          今日の摂取カロリー: <strong>{totalCalories}</strong> kcal
        </span>
        <span>
          登録済みの食事: <strong>{meals.length}</strong> 件
        </span>
      </div>

      {latestMeals.length === 0 ? (
        <p className="muted">
          まだ今日の食事が登録されていません。🍙 ボタンから追加してみましょう。
        </p>
      ) : (
        <ul className="meal-highlight-list">
          {latestMeals.map((meal) => {
            const title = getMealTitle(meal);
            const memoText = meal.memo?.trim();
            const showMemo = memoText && memoText !== title;

            return (
              <li key={meal.id} className="meal-highlight-item">
                <div className="meal-highlight-meta">
                  <span className="meal-type-pill">{getMealLabel(meal.mealType)}</span>
                  <span className="meal-calories">{meal.totalCalories || 0} kcal</span>
                </div>
                <div className="meal-highlight-name">{title}</div>
                {showMemo && <div className="meal-highlight-memo">{memoText}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
