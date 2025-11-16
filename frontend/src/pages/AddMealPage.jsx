// src/pages/AddMealPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import "../App.css";

export default function AddMealPage() {
  const navigate = useNavigate();

  const [mealType, setMealType] = useState("breakfast");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");

  const [foods, setFoods] = useState([
    { id: 1, name: "", portion: "", calories: "" },
  ]);

  const handleFoodChange = (id, field, value) => {
    setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const addFoodRow = () => {
    setFoods((prev) => [
      ...prev,
      { id: Date.now(), name: "", portion: "", calories: "" },
    ]);
  };

  const removeFoodRow = (id) => {
    if (foods.length === 1) return;
    setFoods((prev) => prev.filter((f) => f.id !== id));
  };

  const totalCalories = foods.reduce(
    (sum, f) => sum + (Number(f.calories) || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      mealType,
      date,
      memo,
      foods,
      totalCalories,
    });

    navigate("/");
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <div className="add-meal-page-inner">
          <div className="add-meal-card">
            <div className="add-meal-header">
              <button
                type="button"
                className="add-meal-back"
                onClick={() => navigate(-1)}
              >
                ← ダッシュボードに戻る
              </button>

              <div>
                <h1 className="add-meal-title">新しい食事を追加</h1>
                <p className="add-meal-subtitle">
                  一度の食事で食べたものをまとめて登録できます。
                </p>
              </div>
            </div>

            <form className="add-meal-form" onSubmit={handleSubmit}>
              {/* 食事タイプ + 日付 */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">食事タイプ</label>
                  <div className="meal-type-toggle">
                    {["breakfast", "lunch", "dinner", "snack"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={
                          mealType === t ? "meal-type-btn active" : "meal-type-btn"
                        }
                        onClick={() => setMealType(t)}
                      >
                        {{
                          breakfast: "朝食",
                          lunch: "昼食",
                          dinner: "夕食",
                          snack: "間食",
                        }[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">日付</label>
                  <input
                    className="form-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* 食品リスト */}
              <div className="form-row column">
                <div className="form-group full">
                  <label className="form-label">食品リスト</label>

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
                          className="form-input food-input"
                          type="text"
                          placeholder="例）ごはん"
                          value={food.name}
                          onChange={(e) =>
                            handleFoodChange(food.id, "name", e.target.value)
                          }
                        />
                        <input
                          className="form-input food-input"
                          type="text"
                          placeholder="150g"
                          value={food.portion}
                          onChange={(e) =>
                            handleFoodChange(food.id, "portion", e.target.value)
                          }
                        />
                        <input
                          className="form-input food-input"
                          type="number"
                          placeholder="250"
                          value={food.calories}
                          onChange={(e) =>
                            handleFoodChange(food.id, "calories", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="food-remove-btn"
                          onClick={() => removeFoodRow(food.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-link"
                    onClick={addFoodRow}
                  >
                    ＋ 食品を追加
                  </button>
                </div>
              </div>

              {/* メモ */}
              <div className="form-row">
                <div className="form-group full">
                  <label className="form-label">メモ</label>
                  <textarea
                    className="form-textarea"
                    placeholder="例）調味料少なめ"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
              </div>

              {/* 合計カロリー */}
              <div className="add-meal-footer">
                <div className="total-calorie-display">
                  合計カロリー： <span>{totalCalories}</span> kcal
                </div>

                <div className="add-meal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate(-1)}
                  >
                    キャンセル
                  </button>

                  <button type="submit" className="btn-primary">
                    保存して戻る
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
