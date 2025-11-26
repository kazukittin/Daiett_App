import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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

const weeklyCalories = [
  { day: "月", intake: 1500, burned: 350 },
  { day: "火", intake: 1620, burned: 400 },
  { day: "水", intake: 1380, burned: 320 },
  { day: "木", intake: 1490, burned: 380 },
  { day: "金", intake: 1700, burned: 450 },
  { day: "土", intake: 1820, burned: 500 },
  { day: "日", intake: 1600, burned: 420 },
];

const monthlyCalories = [
  { week: "1週目", intake: 10750, burned: 2500 },
  { week: "2週目", intake: 11200, burned: 2680 },
  { week: "3週目", intake: 10420, burned: 2400 },
  { week: "4週目", intake: 11050, burned: 2550 },
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

          <div className="intake-trend-grid">
            <Card title="1週間のバランス" className="intake-trend-card">
              <div className="section-header">
                <p className="muted small">曜日ごとの摂取/消費を比較</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyCalories} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" />
                  <YAxis unit=" kcal" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="intake" name="摂取" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="burned" name="消費" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="1か月の推移" className="intake-trend-card">
              <div className="section-header">
                <p className="muted small">週ごとの合計で増減を把握</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyCalories} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" />
                  <YAxis unit=" kcal" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="intake" name="摂取" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="burned" name="消費" fill="#f6c343" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
