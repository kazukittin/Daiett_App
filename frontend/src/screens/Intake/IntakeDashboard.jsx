import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getMealSummary } from "../../api/meals.js";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";
import { getTodayISO } from "../../utils/date.js";

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間" },
  { key: "30d", label: "1か月" },
  { key: "1y", label: "1年間" },
];

export default function IntakeDashboard() {
  // Reuse backend-provided trend data (weights + calories) instead of computing on the client.
  const { trend, period, setPeriod } = useWeightTrend(PERIOD_OPTIONS[0].key);
  const [todaySummary, setTodaySummary] = useState({ totalCalories: 0, records: [] });
  const todayISO = getTodayISO();
  const DAILY_GOAL = 1500;

  useEffect(() => {
    getMealSummary({ date: todayISO })
      .then((summary) => setTodaySummary(summary))
      .catch((error) => console.error("Failed to load meal summary", error));
  }, [todayISO]);

  const chartData = useMemo(() => trend?.rows ?? [], [trend]);
  const todayMeals = todaySummary.records || [];
  const mealBreakdown = useMemo(() => {
    return todayMeals.reduce((acc, meal) => {
      const prev = acc[meal.mealType] || 0;
      return { ...acc, [meal.mealType]: prev + (Number(meal.totalCalories) || 0) };
    }, {});
  }, [todayMeals]);
  const subtitle =
    period === "7d"
      ? "曜日ごとの摂取/消費を比較"
      : period === "30d"
        ? "日別の合計推移"
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
                  <h2>{todaySummary.totalCalories} kcal</h2>
                  <small>{DAILY_GOAL} kcal の目標まであと {Math.max(DAILY_GOAL - todaySummary.totalCalories, 0)} kcal</small>
                </div>
                <div className="intake-progress">
                  <div
                    className="intake-progress-bar"
                    style={{ width: `${Math.min((todaySummary.totalCalories / DAILY_GOAL) * 100, 100)}%` }}
                  />
                  <div className="intake-progress-label">
                    <span>進捗</span>
                    <strong>{Math.min(Math.round((todaySummary.totalCalories / DAILY_GOAL) * 100), 100)}%</strong>
                  </div>
                </div>
              </div>

              <div className="section-block">
                <div className="section-header">
                  <h3>食事の内訳</h3>
                </div>
                <ul className="summary-list">
                  {Object.keys(mealBreakdown).length === 0 && <li className="muted">まだ食事が登録されていません。</li>}
                  {Object.entries(mealBreakdown).map(([mealType, calories]) => (
                    <li key={mealType} className="summary-item">
                      <span>{mealType}</span>
                      <strong>{calories} kcal</strong>
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
                {todayMeals.length === 0 ? (
                  <p className="muted">今日の食事はまだ登録されていません。</p>
                ) : (
                  <ul className="upcoming-list">
                    {todayMeals.map((meal) => (
                      <li key={meal.id}>
                        <div className="meal-log-row">
                          <div>
                            <strong>{meal.mealType}</strong>
                            <div className="muted small">{meal.memo}</div>
                          </div>
                          <div>{meal.totalCalories} kcal</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
                  <BarChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" />
                    <YAxis unit=" kcal" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="intakeCalories" name="摂取" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="burnedCalories" name="消費" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
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
