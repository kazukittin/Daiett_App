import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { getMealRecords } from "../../api/meals.js";
import { getMealLabel } from "../../utils/meals.js";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric", weekday: "short" });
};

export default function MealHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getMealRecords()
      .then((data) => {
        if (Array.isArray(data?.records)) {
          setRecords(data.records);
        } else if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      })
      .catch(() => setError("食事履歴の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return records.filter((record) => {
      if (selectedDate && record.date !== selectedDate) return false;
      if (!lowerKeyword) return true;

      const memoText = record.memo?.toLowerCase() || "";
      const foodNames = (record.foods || []).map((food) => food.name?.toLowerCase() || "").join(" ");
      return memoText.includes(lowerKeyword) || foodNames.includes(lowerKeyword);
    });
  }, [keyword, records, selectedDate]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="page meal-history-page">
          <header className="page-header meal-history-header">
            <div>
              <p className="eyebrow">食事履歴</p>
              <h1 className="page-title">過去の食事を振り返る</h1>
              <p className="muted">いつ・どんな食事をしたかをまとめて確認できます。</p>
            </div>

            <div className="meal-history-filters">
              <label className="filter-field">
                <span>日付で絞り込む</span>
                <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
              <label className="filter-field">
                <span>キーワード検索</span>
                <input
                  type="search"
                  placeholder="食品名やメモで検索"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </label>
            </div>
          </header>

          <Card title="食事履歴一覧" className="meal-history-card">
            {loading ? (
              <p className="muted">読込中です…</p>
            ) : error ? (
              <p className="muted">{error}</p>
            ) : filteredRecords.length === 0 ? (
              <p className="muted">該当する食事履歴がありません。</p>
            ) : (
              <ul className="meal-history-list">
                {filteredRecords.map((record) => (
                  <li key={`${record.id}-${record.date}`} className="meal-history-row">
                    <div className="meal-history-meta">
                      <span className="meal-history-date">{formatDate(record.date)}</span>
                      <span className="meal-history-type">{getMealLabel(record.mealType)}</span>
                      <span className="meal-history-calories">{record.totalCalories || 0} kcal</span>
                    </div>
                    <div className="meal-history-body">
                      <div className="meal-history-foods">
                        {(record.foods || []).map((food) => food.name).filter(Boolean).join("、 ") || "食品の記録なし"}
                      </div>
                      {record.memo ? <div className="meal-history-memo">{record.memo}</div> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
