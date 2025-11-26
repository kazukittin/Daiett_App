import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";

const sampleMeals = [
  { label: "朝食", calories: 320 },
  { label: "昼食", calories: 540 },
  { label: "夕食", calories: 340 },
];

const foodLog = [
  "ごはん 150g — 252 kcal",
  "味噌汁 — 80 kcal",
  "サラダ — 120 kcal",
];

export default function IntakeDashboard() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="page intake-page">
          <header className="page-header intake-header">
            <div>
              <h1 className="page-title">摂取カロリー</h1>
              <p className="muted">今日の食事と摂取量をひと目で確認できます</p>
            </div>
            <div className="intake-actions">
              <button type="button" className="btn secondary">食品を検索</button>
              <button type="button" className="btn primary">食事を追加</button>
            </div>
          </header>

          <div className="intake-grid">
            <Card title="今日の摂取カロリー" className="intake-summary-card">
              <div className="intake-summary">
                <div className="metric-highlight">
                  <h2>1,200 kcal</h2>
                  <small>1,500 kcal の目標まであと 300 kcal</small>
                </div>
                <div className="intake-progress">
                  <div className="intake-progress-bar" style={{ width: "80%" }} />
                  <div className="intake-progress-label">
                    <span>進捗</span>
                    <strong>80%</strong>
                  </div>
                </div>
              </div>

              <div className="section-block">
                <div className="section-header">
                  <h3>食事の内訳</h3>
                </div>
                <ul className="summary-list">
                  {sampleMeals.map((meal) => (
                    <li key={meal.label} className="summary-item">
                      <span>{meal.label}</span>
                      <strong>{meal.calories} kcal</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card title="食品ログ" className="intake-log-card">
              <div className="section-block">
                <div className="section-header">
                  <h3>今日の記録</h3>
                  <p className="small muted">最近追加した食品の一覧</p>
                </div>
                <ul className="upcoming-list">
                  {foodLog.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
