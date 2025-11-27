import React, { useMemo, useState } from "react";
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
  { label: "月", intake: 1500, burned: 350 },
  { label: "火", intake: 1620, burned: 400 },
  { label: "水", intake: 1380, burned: 320 },
  { label: "木", intake: 1490, burned: 380 },
  { label: "金", intake: 1700, burned: 450 },
  { label: "土", intake: 1820, burned: 500 },
  { label: "日", intake: 1600, burned: 420 },
];

const monthlyCalories = [
  { label: "1週目", intake: 10750, burned: 2500 },
  { label: "2週目", intake: 11200, burned: 2680 },
  { label: "3週目", intake: 10420, burned: 2400 },
  { label: "4週目", intake: 11050, burned: 2550 },
];

const yearlyCalories = [
  { label: "1月", intake: 45000, burned: 9800 },
  { label: "2月", intake: 43000, burned: 9500 },
  { label: "3月", intake: 47000, burned: 10200 },
  { label: "4月", intake: 45500, burned: 9900 },
  { label: "5月", intake: 46800, burned: 10000 },
  { label: "6月", intake: 46200, burned: 9950 },
  { label: "7月", intake: 48000, burned: 10300 },
  { label: "8月", intake: 47500, burned: 10150 },
  { label: "9月", intake: 46000, burned: 9800 },
  { label: "10月", intake: 47200, burned: 10050 },
  { label: "11月", intake: 45800, burned: 9700 },
  { label: "12月", intake: 48500, burned: 10400 },
];

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間" },
  { key: "30d", label: "1か月" },
  { key: "1y", label: "1年間" },
];

export default function IntakeDashboard() {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0].key);

  const trendData = useMemo(() => {
    if (period === "1y") return yearlyCalories;
    if (period === "30d") return monthlyCalories;
    return weeklyCalories;
  }, [period]);

  const xKey = period === "7d" ? "label" : "label";
  const subtitle =
    period === "7d"
      ? "曜日ごとの摂取/消費を比較"
      : period === "30d"
        ? "週ごとの合計で増減を把握"
        : "月ごとの推移で年間バランスを確認";

  const renderRangeButtons = () => (
    <div className="trend-range-toggle">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => setPeriod(option.key)}
          className={`trend-range-button ${period === option.key ? "active" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

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
            <Card title="摂取・消費の推移" className="intake-trend-card" action={renderRangeButtons()}>
              <div className="section-header">
                <p className="muted small">{subtitle}</p>
              </div>
              <div className="intake-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey={xKey} />
                    <YAxis unit=" kcal" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="intake" name="摂取" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="burned" name="消費" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
