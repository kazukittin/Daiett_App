import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";

const BURN_PERIODS = [
  { key: "7d", label: "1週間" },
  { key: "30d", label: "1か月" },
  { key: "1y", label: "1年間" },
];

const formatDayTick = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

const formatMonthTick = (value) => {
  if (!value) return value;
  const [year, month] = value.split("-");
  return `${year}/${month}`;
};

const formatLabel = (value, period) => (period === "1y" ? formatMonthTick(value) : formatDayTick(value));

export default function BurnDashboard() {
  const navigate = useNavigate();
  const { trend, period, setPeriod } = useWeightTrend(BURN_PERIODS[0].key);

  const burnSeries = useMemo(() => {
    const rows = Array.isArray(trend?.rows) ? trend.rows : [];
    const filtered = rows
      .filter((row) => Number.isFinite(row.burnedCalories))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = filtered.map((row) => formatLabel(row.date, period));
    const values = filtered.map((row) => row.burnedCalories);

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = values.length ? Math.round(total / values.length) : 0;
    const helper =
      period === "1y"
        ? "月ごとの合計 (直近1年間)"
        : period === "30d"
          ? "日別の消費カロリー (直近1か月)"
          : "日別の消費カロリー";

    return { labels, values, total, average, helper };
  }, [period, trend?.rows]);

  const weeklyTotal = useMemo(() => {
    return burnSeries.values.reduce((total, value) => total + value, 0);
  }, [burnSeries.values]);

  const weeklyAverage = useMemo(() => {
    if (!burnSeries.values.length) return 0;
    return Math.round(weeklyTotal / burnSeries.values.length);
  }, [burnSeries.values.length, weeklyTotal]);

  const maxValue = Math.max(...burnSeries.values, 1);
  const yTicks = useMemo(() => {
    const step = Math.max(10, Math.ceil(maxValue / 4));
    const ticks = [];
    for (let value = 0; value <= maxValue; value += step) {
      ticks.push(value);
    }
    if (ticks[ticks.length - 1] !== maxValue) ticks.push(maxValue);
    return ticks.reverse();
  }, [maxValue]);

  return (
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
              <p className="stat-helper">この期間で消費したカロリー</p>
            </div>
            <div className="stat-block">
              <span className="stat-label">1日平均</span>
              <strong className="stat-value">{weeklyAverage} kcal</strong>
              <p className="stat-helper">平均でどれくらい動けているか</p>
            </div>
          </div>
        </Card>

        <Card title="アクティビティの内訳" className="burn-activity-card">
          <p className="muted">まだ運動記録がありません。</p>
        </Card>
      </div>

      <div className="grid-2 burn-detail-grid">
        <Card title="期間の消費カロリー" className="burn-chart-card">
          <div className="burn-chart-header">
            <div>
              <p className="muted">{burnSeries.helper}</p>
              <div className="burn-chart-meta">
                <div>
                  <span className="stat-label">合計</span>
                  <strong className="stat-value">{burnSeries.total} kcal</strong>
                </div>
                <div>
                  <span className="stat-label">平均</span>
                  <strong className="stat-value">{burnSeries.average} kcal</strong>
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
          {burnSeries.values.length === 0 ? (
            <div className="trend-placeholder">まだ消費カロリーのデータがありません。</div>
          ) : (
            <>
              <div className="burn-chart-with-axes">
                <div className="axis-label y-axis">消費カロリー（kcal）</div>
                <div className="burn-chart-body">
                  <div className="burn-y-ticks">
                    {yTicks.map((tick) => (
                      <div key={tick} className="tick-row">
                        <span className="tick-label">{tick}</span>
                        <span className="tick-line" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                  <div className="burn-bars-area">
                    <div
                      className="fake-chart"
                      style={{ gridTemplateColumns: `repeat(${burnSeries.values.length}, minmax(0, 1fr))` }}
                    >
                      {burnSeries.values.map((value, index) => (
                        <div
                          key={`${burnSeries.labels[index]}-${index}`}
                          className="bar"
                          style={{ height: `${Math.round((value / maxValue) * 100)}%` }}
                          title={`${burnSeries.labels[index]}: ${value} kcal`}
                        />
                      ))}
                    </div>
                    <div
                      className="bar-labels"
                      style={{ gridTemplateColumns: `repeat(${burnSeries.labels.length}, minmax(0, 1fr))` }}
                    >
                      {burnSeries.labels.map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="axis-label x-axis">日にち</div>
            </>
          )}
        </Card>

        <TodayWorkout />
      </div>
    </section>
  );
}
