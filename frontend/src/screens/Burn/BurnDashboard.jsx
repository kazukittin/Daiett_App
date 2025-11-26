import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";

const weeklyBurn = [60, 75, 50, 80, 70, 65];
const activities = [
  { label: "ウォーキング", calories: 230 },
  { label: "ランニング", calories: 320 },
  { label: "筋トレ", calories: 110 },
];

export default function BurnDashboard() {
  const navigate = useNavigate();

  const weeklyTotal = useMemo(
    () => weeklyBurn.reduce((total, value) => total + value, 0),
    [],
  );

  const weeklyAverage = useMemo(
    () => Math.round(weeklyTotal / weeklyBurn.length),
    [weeklyTotal],
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="page burn-page">
          <header className="page-header burn-header">
            <div>
              <p className="eyebrow">消費カロリー</p>
              <h1 className="page-title">今日と今週のアクティビティ</h1>
              <p className="muted">どれくらい動けているかをすぐ確認し、必要なら運動を追加しましょう。</p>
            </div>
            <div className="header-actions">
              <button type="button" className="ds-button secondary" onClick={() => navigate("/settings/workout")}>設定を見直す</button>
              <button type="button" className="ds-button primary" onClick={() => navigate("/exercises/add")}>運動を記録</button>
            </div>
          </header>

          <div className="burn-overview-grid">
            <Card title="今週のサマリー" className="burn-summary-card">
              <div className="burn-summary-stats">
                <div className="stat-block">
                  <span className="stat-label">合計</span>
                  <strong className="stat-value">{weeklyTotal} kcal</strong>
                  <p className="stat-helper">1週間で消費したカロリー</p>
                </div>
                <div className="stat-block">
                  <span className="stat-label">1日平均</span>
                  <strong className="stat-value">{weeklyAverage} kcal</strong>
                  <p className="stat-helper">平均でどれくらい動けているか</p>
                </div>
              </div>
            </Card>

            <Card title="アクティビティの内訳" className="burn-activity-card">
              <ul className="upcoming-list">
                {activities.map((activity) => (
                  <li key={activity.label} className="activity-row">
                    <div className="activity-label">{activity.label}</div>
                    <div className="activity-value">{activity.calories} kcal</div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid-2 burn-detail-grid">
            <Card title="週間の消費カロリー" className="burn-chart-card">
              <div className="fake-chart">
                {weeklyBurn.map((height, index) => (
                  <div key={index} className="bar" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="bar-labels">
                {["月", "火", "水", "木", "金", "土"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </Card>

            <TodayWorkout />
          </div>
        </section>
      </main>
    </div>
  );
}
