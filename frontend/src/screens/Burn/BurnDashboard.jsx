import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";

const BURN_PERIODS = [
  { key: "7d", label: "1週間" },
  { key: "30d", label: "1か月" },
  { key: "1y", label: "1年間" },
];

const burnSeriesByPeriod = {
  "7d": {
    labels: ["月", "火", "水", "木", "金", "土", "日"],
    values: [60, 75, 50, 80, 70, 65, 55],
    helper: "日別の消費カロリー",
  },
  "30d": {
    labels: ["1週目", "2週目", "3週目", "4週目"],
    values: [320, 340, 310, 360],
    helper: "週ごとの合計 (直近1か月)",
  },
  "1y": {
    labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    values: [1250, 1320, 1280, 1400, 1350, 1420, 1500, 1470, 1390, 1300, 1220, 1180],
    helper: "月ごとの合計 (直近1年間)",
  },
};

const activities = [
  { label: "ウォーキング", calories: 230 },
  { label: "ランニング", calories: 320 },
  { label: "筋トレ", calories: 110 },
];

export default function BurnDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState(BURN_PERIODS[0].key);

  const weeklyTotal = useMemo(
    () => burnSeriesByPeriod["7d"].values.reduce((total, value) => total + value, 0),
    [],
  );

  const weeklyAverage = useMemo(
    () => Math.round(weeklyTotal / burnSeriesByPeriod["7d"].values.length),
    [weeklyTotal],
  );

  const chartSeries = useMemo(() => burnSeriesByPeriod[period] ?? burnSeriesByPeriod["7d"], [period]);

  const chartTotal = useMemo(
    () => chartSeries.values.reduce((total, value) => total + value, 0),
    [chartSeries],
  );

  const chartAverage = useMemo(
    () => Math.round(chartTotal / chartSeries.values.length),
    [chartTotal, chartSeries.values.length],
  );

  const maxValue = Math.max(...chartSeries.values, 1);

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
              <button type="button" className="ds-button ghost" onClick={() => navigate("/exercises/history")}>
                運動履歴を開く
              </button>
              <button type="button" className="ds-button secondary" onClick={() => navigate("/settings/workouts")}>
                設定を見直す
              </button>
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
            <Card title="期間の消費カロリー" className="burn-chart-card">
              <div className="burn-chart-header">
                <div>
                  <p className="muted">{chartSeries.helper}</p>
                  <div className="burn-chart-meta">
                    <div>
                      <span className="stat-label">合計</span>
                      <strong className="stat-value">{chartTotal} kcal</strong>
                    </div>
                    <div>
                      <span className="stat-label">平均</span>
                      <strong className="stat-value">{chartAverage} kcal</strong>
                    </div>
                  </div>
                </div>
                <div className="trend-range-toggle" aria-label="期間切り替え">
                  {BURN_PERIODS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`trend-range-button ${period === item.key ? "active" : ""}`}
                      onClick={() => setPeriod(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="burn-chart-with-axes">
                <div className="axis-label y-axis">消費カロリー（kcal）</div>
                <div className="burn-chart-body">
                  <div
                    className="fake-chart"
                    style={{ gridTemplateColumns: `repeat(${chartSeries.values.length}, minmax(0, 1fr))` }}
                  >
                    {chartSeries.values.map((value, index) => (
                      <div
                        key={`${chartSeries.labels[index]}-${index}`}
                        className="bar"
                        style={{ height: `${Math.round((value / maxValue) * 100)}%` }}
                        title={`${chartSeries.labels[index]}: ${value} kcal`}
                      />
                    ))}
                  </div>
                  <div
                    className="bar-labels"
                    style={{ gridTemplateColumns: `repeat(${chartSeries.labels.length}, minmax(0, 1fr))` }}
                  >
                    {chartSeries.labels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="axis-label x-axis">日にち</div>
            </Card>

            <TodayWorkout />
          </div>
        </section>
      </main>
    </div>
  );
}
