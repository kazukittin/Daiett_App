import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import MealTypeTabs from "../../components/meals/MealTypeTabs.jsx";
import { useMealEntries } from "../../hooks/useMealEntries.js";
import { getTodayISO } from "../../utils/date.js";
import FoodSetManager from "../../components/food/FoodSetManager.jsx";

const createFoodRow = () => ({ id: Date.now(), name: "", portion: "", calories: "" });

export default function AddMeal() {
  const navigate = useNavigate();
  const { addMealEntry } = useMealEntries();

  const [mealType, setMealType] = useState("breakfast");
  const [date, setDate] = useState(getTodayISO());
  const [memo, setMemo] = useState("");
  const [foods, setFoods] = useState([createFoodRow()]);
  const [formError, setFormError] = useState("");

  const handleFoodChange = (id, field, value) => {
    setFoods((prev) => prev.map((food) => (food.id === id ? { ...food, [field]: value } : food)));
  };

  const addFoodRow = () => setFoods((prev) => [...prev, createFoodRow()]);

  const removeFoodRow = (id) => {
    if (foods.length === 1) return;
    setFoods((prev) => prev.filter((food) => food.id !== id));
  };

  const totalCalories = foods.reduce((sum, food) => sum + (Number(food.calories) || 0), 0);

  const validateForm = () => {
    if (!date) {
      setFormError("日付を入力してください。");
      return false;
    }

    const hasName = foods.some((food) => food.name.trim() !== "");
    if (!hasName) {
      setFormError("食品名を1つ以上入力してください。");
      return false;
    }

    const invalidCalories = foods.some(
      (food) => food.calories && (!Number.isFinite(Number(food.calories)) || Number(food.calories) <= 0)
    );

    if (invalidCalories) {
      setFormError("カロリーは正の数値で入力してください。");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    await addMealEntry({
      mealType,
      date,
      memo,
      foods: foods.filter((food) => food.name.trim()),
      totalCalories,
    });

    navigate("/intake");
  };

  return (
    <section className="page add-meal-page">
      <header className="page-header meal-page-header">
        <div>
          <p className="eyebrow">摂取カロリー</p>
          <h1 className="page-title">食事を追加して今日の摂取を管理</h1>
          <p className="muted">食事タイプと日付を選んで、食べたものをリストアップしましょう。カロリーの合計は自動で計算されます。</p>
        </div>
        <div className="header-actions">
          <div className="total-calorie-chip">
            合計カロリー <strong>{totalCalories}</strong> kcal
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            戻る
          </Button>
        </div>
      </header>

      <div className="add-meal-layout">
        <Card title="入力フォーム" className="meal-form-card">
          <form className="weight-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-control">
                <label>食事タイプ</label>
                <MealTypeTabs value={mealType} onChange={setMealType} />
              </div>

              <div className="form-control">
                <label>日付</label>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
            </div>

            <div className="form-control">
              <div className="field-header">
                <label>食品リスト</label>
                <Button type="button" variant="ghost" onClick={addFoodRow}>
                  ＋ 食品を追加
                </Button>
              </div>
              <div className="foods-table">
                <div className="foods-header">
                  <span>食品名</span>
                  <span>分量</span>
                  <span>カロリー (kcal)</span>
                  <span>操作</span>
                </div>
                {foods.map((food) => (
                  <div key={food.id} className="food-row">
                    <input
                      value={food.name}
                      onChange={(event) => handleFoodChange(food.id, "name", event.target.value)}
                      placeholder="例: サラダ"
                    />
                    <input
                      value={food.portion}
                      onChange={(event) => handleFoodChange(food.id, "portion", event.target.value)}
                      placeholder="例: 1人前"
                    />
                    <input
                      type="number"
                      min="0"
                      value={food.calories}
                      onChange={(event) => handleFoodChange(food.id, "calories", event.target.value)}
                      placeholder="200"
                    />
                    <Button type="button" variant="ghost" onClick={() => removeFoodRow(food.id)} disabled={foods.length === 1}>
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-control">
              <label>メモ (任意)</label>
              <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="気づいたことなど" />
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                キャンセル
              </Button>
              <Button type="submit" variant="primary">
                追加する
              </Button>
            </div>
          </form>
        </Card>

        <Card title="入力のコツ" className="meal-tips-card">
          <ul className="tip-list">
            <li>カロリーが不明な場合はざっくりでもOK</li>
            <li>分量は「1皿」「1個」などわかりやすい単位で</li>
            <li>後から編集できるのでまずは記録を残すのがおすすめ</li>
          </ul>
        </Card>
      </div>

      <FoodSetManager onApplied={() => navigate("/intake")}></FoodSetManager>
    </section>
  );
}
