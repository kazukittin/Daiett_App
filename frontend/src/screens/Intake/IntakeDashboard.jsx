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
        <header className="topbar">
          <div className="breadcrumb">ホーム / <span>摂取カロリー</span></div>
        </header>

        <section className="content-grid">
          <div className="grid-2">
            <Card title="今日の摂取カロリー">
              <div className="metric-highlight">
                <h2>1,200 kcal</h2>
                <small>1,500 kcal の目標まであと 300 kcal</small>
              </div>

              <ul className="summary-list">
                {sampleMeals.map((meal) => (
                  <li key={meal.label} className="summary-item">
                    <span>{meal.label}</span>
                    <strong>{meal.calories} kcal</strong>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="食品ログ">
              <ul className="upcoming-list">
                {foodLog.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
