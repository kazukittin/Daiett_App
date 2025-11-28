import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import MealTypeTabs from "../../components/meals/MealTypeTabs.jsx";
import { useMealEntries } from "../../hooks/useMealEntries.js";
import { getTodayISO } from "../../utils/date.js";

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
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">

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
                      <span>量</span>
                      <span>カロリー(kcal)</span>
                      <span></span>
                    </div>

                    {foods.map((food) => (
                      <div className="foods-row" key={food.id}>
                        <input
                          className="meal-input"
                          type="text"
                          placeholder="例）ごはん"
                          value={food.name}
                          onChange={(event) => handleFoodChange(food.id, "name", event.target.value)}
                        />
                        <input
                          className="meal-input"
                          type="text"
                          placeholder="150g"
                          value={food.portion}
                          onChange={(event) => handleFoodChange(food.id, "portion", event.target.value)}
                        />
                        <input
                          className="meal-input"
                          type="number"
                          inputMode="numeric"
                          placeholder="250"
                          value={food.calories}
                          onChange={(event) => handleFoodChange(food.id, "calories", event.target.value)}
                        />
                        <button type="button" className="food-remove-btn" onClick={() => removeFoodRow(food.id)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-control">
                  <label>メモ</label>
                  <textarea
                    rows="3"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    placeholder="例）調味料少なめ"
                  />
                </div>

                {formError && <div className="form-error">{formError}</div>}

                <div className="flex-between">
                  <div className="total-calorie-display">
                    合計カロリー： <span>{totalCalories}</span> kcal
                  </div>
                  <div className="add-meal-actions">
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                      キャンセル
                    </Button>
                    <Button type="submit">保存して戻る</Button>
                  </div>
                </div>
              </form>
            </Card>

            <aside className="ds-card compact info-card">
              <div className="ds-card-title">入力のコツ</div>
              <ul className="summary-list">
                <li className="summary-item">
                  <span>食品を分けて入力</span>
                  <strong>カロリーが正確に</strong>
                </li>
                <li className="summary-item">
                  <span>カロリー不明なとき</span>
                  <strong>目安でもOK</strong>
                </li>
                <li className="summary-item">
                  <span>メモ欄</span>
                  <strong>味付け/気づきを残す</strong>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
