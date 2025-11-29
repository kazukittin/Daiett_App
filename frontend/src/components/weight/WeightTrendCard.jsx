import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  BarChart,
  ReferenceLine,
} from "recharts";
import Card from "../ui/Card";
import { MOCK_CALORIE_TRENDS, MOCK_WEIGHT_RECORDS } from "../../mock/mockCalorieTrends.js";

// ダッシュボードの見切れチェック用にモックデータを使う切り替えを用意。
const USE_MOCK_DATA = true;

const PERIOD_OPTIONS = [
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

/**
 * Custom tooltip showing weight and calorie balance for the hovered date/month.
 */
const TrendTooltip = ({ active, payload, label, period }) => {
  if (!active || !payload || !payload.length) return null;

  const weight = payload.find((entry) => entry.dataKey === "weight")?.value;
  const intake = payload.find((entry) => entry.dataKey === "intakeCalories")?.value ?? null;
  const burned = payload.find((entry) => entry.dataKey === "burnedCalories")?.value ?? null;
  const diff =
    intake !== null && burned !== null && Number.isFinite(intake) && Number.isFinite(burned)
      ? intake - burned
      : null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{formatLabel(label, period)}</p>
      {weight !== undefined && weight !== null && (
        <p>
          体重: <strong>{weight}</strong> kg
        </p>
      )}
      {intake !== null && (
        <p>
          摂取: <strong>{intake}</strong> kcal
        </p>
      )}
      {burned !== null && (
        <p>
          消費: <strong>{burned}</strong> kcal
        </p>
      )}
      {diff !== null && (
        <p>
          差分: <strong>{diff}</strong> kcal
        </p>
      )}
    </div>
  );
};

/**
 * 体重とカロリーをまとめて表示するトレンドチャート。
 */
const WeightTrendCard = ({ records = [], trend, period = PERIOD_OPTIONS[0].key, onPeriodChange }) => {
  const mockRows = useMemo(() => {
    // 体重・摂取・消費を日付でマージしたモックデータ。
    const byDate = new Map();
    MOCK_CALORIE_TRENDS.forEach((row) => {
      byDate.set(row.date, { ...row });
    });
    MOCK_WEIGHT_RECORDS.forEach((row) => {
      const existing = byDate.get(row.date) ?? {};
      byDate.set(row.date, { ...existing, date: row.date, weight: row.weight });
    });
    return Array.from(byDate.values());
  }, []);

  const mergedRows = useMemo(() => {
    if (USE_MOCK_DATA) return mockRows;
    return trend?.rows ?? records ?? [];
  }, [mockRows, records, trend]);

  const hasCalorieData = mergedRows.some(
    (row) => Number.isFinite(row.intakeCalories) || Number.isFinite(row.burnedCalories),
  );
  // Ensure both intake and burned calories exist per row so the stacked bars always align.
  const chartData = useMemo(() => {
    return [...mergedRows]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row) => ({
        ...row,
        intakeCalories: Number.isFinite(row.intakeCalories) ? row.intakeCalories : 0,
        burnedCalories: Number.isFinite(row.burnedCalories) ? row.burnedCalories : 0,
      }));
  }, [mergedRows]);

  const weightStats = useMemo(() => {
    if (!chartData.length) return { latest: null, diff: null };
    const sorted = [...chartData]
      .filter((row) => Number.isFinite(row.weight))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!sorted.length) return trend?.weightStats ?? { latest: null, diff: null };
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    return { latest: last, diff: Number((last - first).toFixed(1)) };
  }, [chartData, trend?.weightStats]);

  const calorieStats = useMemo(() => {
    const intakeSum = chartData.reduce((sum, row) => sum + (Number(row.intakeCalories) || 0), 0);
    const burnedSum = chartData.reduce((sum, row) => sum + (Number(row.burnedCalories) || 0), 0);
    if (!chartData.length) return trend?.calorieStats ?? { avgIntake: null, avgBurned: null, diff: null };
    const avgIntake = Math.round(intakeSum / chartData.length);
    const avgBurned = Math.round(burnedSum / chartData.length);
    return { avgIntake, avgBurned, diff: avgIntake - avgBurned };
  }, [chartData, trend?.calorieStats]);

  const renderRangeButtons = () => (
    <div className="trend-range-toggle">
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onPeriodChange?.(option.key)}
          className={`trend-range-button ${period === option.key ? "active" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const tickFormatter = (value) => formatLabel(value, period);
  const noData = !chartData.length;

  return (
    <Card title="体重 & カロリートレンド" action={renderRangeButtons()} className="weight-trend-card">
      <div className="trend-stats">
        <div className="trend-stat">
          <p className="trend-stat-label">最新の体重</p>
          <strong className="trend-stat-value">{weightStats.latest ? `${weightStats.latest} kg` : "-"}</strong>
          {weightStats.diff !== null && (
            <span className={`trend-pill ${weightStats.diff <= 0 ? "positive" : "negative"}`}>
              {weightStats.diff > 0 ? "+" : ""}
              {weightStats.diff} kg
            </span>
          )}
        </div>
        <div className="trend-divider" aria-hidden />
        <div className="trend-stat">
          <p className="trend-stat-label">平均摂取 / 消費</p>
          <strong className="trend-stat-value">
            {calorieStats.avgIntake !== null && calorieStats.avgBurned !== null
              ? `${calorieStats.avgIntake} / ${calorieStats.avgBurned} kcal`
              : "-"}
          </strong>
          {calorieStats.diff !== null && (
            <span className={`trend-pill ${calorieStats.diff <= 0 ? "positive" : "negative"}`}>
              差分 {calorieStats.diff > 0 ? "+" : ""}
              {calorieStats.diff} kcal
            </span>
          )}
        </div>
      </div>

      {noData ? (
        <div className="trend-placeholder">まだデータがありません。体重やカロリーを記録してみましょう。</div>
      ) : (
        <div className="trend-chart-grid">
          <div className="trend-section">
            <div className="trend-section-header">
              <h3 className="trend-subtitle">体重の推移</h3>
              <p className="muted small">ラインのみで変化を確認</p>
            </div>
            {/* 固定高さのコンテナで軸やツールチップが途切れないようにする */}
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tickFormatter={tickFormatter} />
                  <YAxis
                    tickCount={6}
                    domain={["auto", "auto"]}
                    width={56}
                    tickFormatter={(value) => (Number.isFinite(value) ? value : "")}
                    label={{ value: "kg", angle: -90, position: "insideLeft", offset: 10 }}
                  />
                  <Tooltip content={<TrendTooltip period={period} />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name={period === "1y" ? "平均体重" : "体重"}
                    stroke="var(--color-primary)"
                    fill="rgba(59,130,246,0.12)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {hasCalorieData && (
            <div className="trend-section">
              <div className="trend-section-header">
                <h3 className="trend-subtitle">摂取・消費カロリー</h3>
                <p className="muted small">棒グラフで日/週/月ごとのバランス</p>
              </div>
              {/* データキーを揃えた状態でバーを並べ、背の高いツールチップも収まる余白を確保 */}
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tickFormatter={tickFormatter} />
                    <YAxis
                      tickCount={6}
                      width={56}
                      tickFormatter={(value) => (Number.isFinite(value) ? value : "")}
                      label={{ value: "kcal", angle: -90, position: "insideLeft", offset: 10 }}
                    />
                    <Tooltip content={<TrendTooltip period={period} />} />
                    <Legend />
                    <ReferenceLine y={0} stroke="var(--color-border-strong)" />
                    <Bar
                      dataKey="intakeCalories"
                      name={period === "1y" ? "月間摂取" : "摂取カロリー"}
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      dataKey="burnedCalories"
                      name={period === "1y" ? "月間消費" : "消費カロリー"}
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {!hasCalorieData && !noData && (
        <p className="muted" style={{ margin: 0 }}>
          カロリーデータがありません。追加すると棒グラフが表示されます。
        </p>
      )}
    </Card>
  );
};

export default WeightTrendCard;
