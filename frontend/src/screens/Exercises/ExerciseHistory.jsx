import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { getWorkoutRecords } from "../../api/workouts.js";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric", weekday: "short" });
};

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "";
  return `${minutes} 分`;
};

export default function ExerciseHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getWorkoutRecords()
      .then((data) => {
        if (Array.isArray(data?.records)) {
          setRecords(data.records);
        } else if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      })
      .catch(() => setError("運動履歴の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
    return records.filter((record) => {
      if (selectedDate && record.date !== selectedDate) return false;
      if (!lowerKeyword) return true;

      const memoText = record.memo?.toLowerCase() || "";
      const typeText = record.type?.toLowerCase() || "";
      return memoText.includes(lowerKeyword) || typeText.includes(lowerKeyword);
    });
  }, [keyword, records, selectedDate]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="page exercise-history-page">
          <header className="page-header exercise-history-header">
            <div>
              <p className="eyebrow">運動履歴</p>
              <h1 className="page-title">過去の運動を確認する</h1>
              <p className="muted">日付やキーワードで検索し、消費カロリーの履歴を振り返れます。</p>
            </div>

            <div className="exercise-history-filters">
              <label className="filter-field">
                <span>日付で絞り込む</span>
                <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
              <label className="filter-field">
                <span>キーワード検索</span>
                <input
                  type="search"
                  placeholder="運動名やメモで検索"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </label>
            </div>
          </header>

          <Card title="運動履歴一覧" className="exercise-history-card">
            {loading ? (
              <p className="muted">読込中です…</p>
            ) : error ? (
              <p className="muted">{error}</p>
            ) : filteredRecords.length === 0 ? (
              <p className="muted">該当する運動履歴がありません。</p>
            ) : (
              <ul className="exercise-history-list">
                {filteredRecords.map((record) => (
                  <li key={`${record.id}-${record.date}`} className="exercise-history-row">
                    <div className="exercise-history-meta">
                      <span className="exercise-history-date">{formatDate(record.date)}</span>
                      {record.type ? <span className="exercise-history-type">{record.type}</span> : null}
                      {Number.isFinite(record.calories) ? (
                        <span className="exercise-history-calories">{record.calories} kcal</span>
                      ) : null}
                    </div>
                    <div className="exercise-history-body">
                      {Number.isFinite(record.duration) && (
                        <div className="exercise-history-duration">{formatDuration(record.duration)}</div>
                      )}
                      {record.memo ? <div className="exercise-history-memo">{record.memo}</div> : null}
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
