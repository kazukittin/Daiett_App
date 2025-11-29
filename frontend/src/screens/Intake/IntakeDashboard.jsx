import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getMealSummary } from "../../api/meals.js";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";
import { getTodayISO } from "../../utils/date.js";

const normalizeCalorieTrends = (rows = []) =>
  rows
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((row) => ({
      date: row.date,
      intakeCalories: Number.isFinite(row.intakeCalories)
        ? row.intakeCalories
        : Number.isFinite(row.intake)
          ? row.intake
          : 0,
      burnedCalories: Number.isFinite(row.burnedCalories)
        ? row.burnedCalories
        : Number.isFinite(row.burned)
          ? row.burned
          : 0,
    }));

// Merge separate intake/burned arrays by date to guarantee both keys exist for Recharts bars.
const mergeCalorieTrends = (intakeList = [], burnedList = []) => {
  const map = new Map();

  intakeList.forEach((d) => {
    map.set(d.date, {
      date: d.date,
      intakeCalories: Number.isFinite(d.intakeCalories)
        ? d.intakeCalories
        : Number.isFinite(d.intake)
          ? d.intake
          : 0,
      burnedCalories: 0,
    });
  });

  burnedList.forEach((d) => {
    const existing = map.get(d.date) ?? {
      date: d.date,
      intakeCalories: 0,
      burnedCalories: 0,
    };
    existing.burnedCalories = Number.isFinite(d.burnedCalories)
      ? d.burnedCalories
      : Number.isFinite(d.burned)
        ? d.burned
        : 0;
    map.set(d.date, existing);
  });

  return normalizeCalorieTrends(Array.from(map.values()));
};

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間" },
  { key: "30d", label: "1か月" },
  { key: "1y", label: "1年間" },
];

const CalorieTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const intake = payload.find((entry) => entry.dataKey === "intakeCalories")?.value ?? 0;
  const burned = payload.find((entry) => entry.dataKey === "burnedCalories")?.value ?? 0;
  const diff = intake - burned;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p>
        摂取: <strong>{intake}</strong> kcal
      </p>
      <p>
        消費: <strong>{burned}</strong> kcal
      </p>
      <p>
        差分: <strong>{diff}</strong> kcal
      </p>
    </div>
  );
};

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

  const chartData = useMemo(() => {
    // Prefer a combined trend payload; otherwise merge separate intake/burned series to keep both bars visible.
    const combinedRows = Array.isArray(trend?.rows) ? normalizeCalorieTrends(trend.rows) : [];
    const filteredCombined = combinedRows.filter(
      (row) => Number.isFinite(row.intakeCalories) || Number.isFinite(row.burnedCalories),
    );
    const hasBothKeys = filteredCombined.some((row) => Number.isFinite(row.intakeCalories))
      && filteredCombined.some((row) => Number.isFinite(row.burnedCalories));

    if (hasBothKeys) {
      return filteredCombined;
    }

    const intakeList = normalizeCalorieTrends(trend?.intakeTrends || trend?.calorieIntake || []);
    const burnedList = normalizeCalorieTrends(trend?.burnedTrends || trend?.calorieBurned || []);

    const merged = mergeCalorieTrends(intakeList, burnedList);

    return merged.filter((row) => Number.isFinite(row.intakeCalories) || Number.isFinite(row.burnedCalories));
  }, [trend]);

  useEffect(() => {
    console.log("[CalorieBalanceChart] merged data", chartData);
  }, [chartData]);

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
                    <YAxis
                      allowDecimals={false}
                      width={56}
                      tickFormatter={(value) => (Number.isFinite(value) ? value : "")}
                      label={{ value: "kcal", angle: -90, position: "insideLeft", offset: 8 }}
                    />
                    <Tooltip content={<CalorieTooltip />} />
                    <Legend />
                    <Bar dataKey="intakeCalories" name="摂取カロリー" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="burnedCalories" name="消費カロリー" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
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
