import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { getMealRecords } from "../../api/meals.js";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });
};

export default function MealHistory() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getMealRecords()
      .then((data) => {
        if (data && Array.isArray(data.records)) {
          setHistory(data.records);
        } else {
          setHistory(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => setHistory([]));
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return history;
    return history.filter((meal) => meal.mealType?.toLowerCase().includes(filter.trim().toLowerCase()));
  }, [filter, history]);

  return (
    <section className="page meal-history-page">
      <header className="page-header meal-history-header">
        <div>
          <p className="eyebrow">摂取カロリー</p>
          <h1 className="page-title">食事履歴</h1>
          <p className="muted">最近の食事を確認して、摂取バランスを振り返りましょう。</p>
        </div>
        <div className="filter-area">
          <label className="filter-field">
            <span>食事タイプで絞り込み</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="breakfast, lunch..." />
          </label>
        </div>
      </header>

      <Card title="履歴一覧" className="meal-history-card">
        {filtered.length === 0 ? (
          <p className="muted">履歴がありません。</p>
        ) : (
          <ul className="meal-history-list">
            {filtered.map((meal) => (
              <li key={meal.id} className="meal-history-row">
                <div className="meal-history-meta">
                  <span className="meal-history-date">{formatDate(meal.date)}</span>
                  <span className="meal-history-type">{meal.mealType}</span>
                </div>
                <div className="meal-history-body">
                  <div className="meal-history-calories">{meal.totalCalories} kcal</div>
                  {meal.memo && <div className="meal-history-memo">{meal.memo}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
