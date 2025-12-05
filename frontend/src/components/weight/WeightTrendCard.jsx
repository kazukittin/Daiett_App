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

  const tooltipStyle = {
    background: "rgba(255, 255, 255, 0.98)",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(10px)",
  };

  const labelStyle = {
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#374151",
    marginBottom: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
  };

  const itemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    margin: "6px 0",
    fontSize: "0.85rem",
  };

  const valueStyle = {
    fontWeight: 700,
    fontSize: "0.95rem",
  };

  return (
    <div className="chart-tooltip fade-in" style={tooltipStyle}>
      <p style={labelStyle}>{formatLabel(label, period)}</p>
      {weight !== undefined && weight !== null && (
        <div style={itemStyle}>
          <span style={{ color: "#6b7280" }}>体重:</span>
          <strong style={{ ...valueStyle, color: "#3f8a62" }}>{weight} kg</strong>
        </div>
      )}
      {intake !== null && (
        <div style={itemStyle}>
          <span style={{ color: "#6b7280" }}>摂取:</span>
          <strong style={{ ...valueStyle, color: "#3b82f6" }}>{intake} kcal</strong>
        </div>
      )}
      {burned !== null && (
        <div style={itemStyle}>
          <span style={{ color: "#6b7280" }}>消費:</span>
          <strong style={{ ...valueStyle, color: "#10b981" }}>{burned} kcal</strong>
        </div>
      )}
      {diff !== null && (
        <div style={{ ...itemStyle, marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
          <span style={{ color: "#6b7280" }}>差分:</span>
          <strong style={{ ...valueStyle, color: diff > 0 ? "#f59e0b" : "#10b981" }}>
            {diff > 0 ? "+" : ""}{diff} kcal
          </strong>
        </div>
      )}
    </div>
  );
};

/**
 * 体重とカロリーをまとめて表示するトレンドチャート。
 */
const WeightTrendCard = ({ records = [], trend, period = PERIOD_OPTIONS[0].key, onPeriodChange }) => {
  const mergedRows = useMemo(() => {
    return trend?.rows ?? records ?? [];
  }, [records, trend]);

  // 実データ（体重またはカロリー）が存在する行だけをグラフに反映する
  const filteredRows = useMemo(
    () =>
      mergedRows.filter(
        (row) =>
          Number.isFinite(row?.weight) ||
          Number.isFinite(row?.intakeCalories) ||
          Number.isFinite(row?.burnedCalories),
      ),
    [mergedRows],
  );

  const hasCalorieData = filteredRows.some(
    (row) => Number.isFinite(row.intakeCalories) || Number.isFinite(row.burnedCalories),
  );
  // Ensure both intake and burned calories exist per row so the stacked bars always align.
  const chartData = useMemo(() => {
    return [...filteredRows]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((row) => ({
        ...row,
        intakeCalories: Number.isFinite(row.intakeCalories) ? row.intakeCalories : 0,
        burnedCalories: Number.isFinite(row.burnedCalories) ? row.burnedCalories : 0,
      }));
  }, [filteredRows]);

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

  const [metric, setMetric] = React.useState("weight");

  const metricOptions = [
    { key: "weight", label: "体重", unit: "kg", color: "#3b82f6" },
    { key: "bodyFat", label: "体脂肪率", unit: "%", color: "#f59e0b" },
    { key: "muscleMass", label: "筋肉量", unit: "kg", color: "#ef4444" },
    { key: "waist", label: "ウエスト", unit: "cm", color: "#10b981" },
    { key: "visceralFat", label: "内臓脂肪", unit: "Lv", color: "#8b5cf6" },
  ];

  const currentMetric = metricOptions.find((m) => m.key === metric);

  const renderRangeButtons = () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <select
        value={metric}
        onChange={(e) => setMetric(e.target.value)}
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          fontSize: "0.85rem",
          background: "#fff",
        }}
      >
        {metricOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
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
    </div>
  );

  const tickFormatter = (value) => formatLabel(value, period);
  const noData = !chartData.length;

  return (
    <Card title={`${currentMetric.label} & カロリートレンド`} action={renderRangeButtons()} className="weight-trend-card">
      <div className="trend-stats">
        <div className="trend-stat">
          <p className="trend-stat-label">最新の{currentMetric.label}</p>
          <strong className="trend-stat-value">
            {chartData.length > 0 && Number.isFinite(chartData[chartData.length - 1][metric])
              ? `${chartData[chartData.length - 1][metric]} ${currentMetric.unit}`
              : "-"}
          </strong>
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
              <h3 className="trend-subtitle">{currentMetric.label}の推移</h3>
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
                    label={{ value: currentMetric.unit, angle: -90, position: "insideLeft", offset: 10 }}
                  />
                  <Tooltip content={<TrendTooltip period={period} />} />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    name={currentMetric.label}
                    stroke={currentMetric.color}
                    fill={`${currentMetric.color}20`}
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
