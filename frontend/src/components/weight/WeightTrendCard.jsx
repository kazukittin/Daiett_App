import React, { useMemo, useState } from "react";
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
import { getMonthKey } from "../../utils/date";

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間", days: 7 },
  { key: "30d", label: "1か月", days: 30 },
  { key: "1y", label: "1年間", months: 12 },
];

/**
 * @typedef {Object} WeightRecord
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} weight
 *
 * @typedef {Object} CalorieTrend
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} intakeCalories
 * @property {number} burnedCalories
 *
 * @typedef {Object} WeightTrendCardProps
 * @property {WeightRecord[]} records
 * @property {CalorieTrend[]} [calorieTrends]
 */

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

const dateKeyFromDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

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
 * @param {WeightTrendCardProps} props
 */
const WeightTrendCard = ({ records = [], calorieTrends = [] }) => {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0].key);
  const hasCalorieData = Array.isArray(calorieTrends) && calorieTrends.length > 0;

  const weightStats = useMemo(() => {
    if (!records.length) return { latest: null, diff: null };

    const sorted = [...records]
      .map((record) => ({ ...record, weight: Number(record.weight) }))
      .filter((record) => Number.isFinite(record.weight))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const startWeight = sorted[0]?.weight ?? null;
    const latestWeight = sorted[sorted.length - 1]?.weight ?? null;
    const diff =
      startWeight !== null && latestWeight !== null && Number.isFinite(startWeight) && Number.isFinite(latestWeight)
        ? +(latestWeight - startWeight).toFixed(1)
        : null;

    return { latest: latestWeight ?? null, diff };
  }, [records]);

  const latestDate = useMemo(() => {
    const dates = [
      ...records.map((record) => new Date(record.date)),
      ...calorieTrends.map((trend) => new Date(trend.date)),
    ].filter((date) => !Number.isNaN(date.getTime()));

    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [records, calorieTrends]);

  const monthKeys = useMemo(() => {
    if (!latestDate) return [];
    return Array.from({ length: 12 }).map((_, index) => {
      const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - (11 - index), 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    });
  }, [latestDate]);

  const chartData = useMemo(() => {
    if (!latestDate) return [];

    const sortedWeights = [...records]
      .map((record) => ({ ...record, weight: Number(record.weight) }))
      .filter((record) => Number.isFinite(record.weight) && !Number.isNaN(new Date(record.date)))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const sortedCalories = [...calorieTrends]
      .map((trend) => ({
        ...trend,
        intakeCalories: Number(trend.intakeCalories),
        burnedCalories: Number(trend.burnedCalories),
      }))
      .filter(
        (trend) =>
          Number.isFinite(trend.intakeCalories) &&
          Number.isFinite(trend.burnedCalories) &&
          !Number.isNaN(new Date(trend.date)),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (period === "1y") {
      const startMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() - 11, 1);
      const monthlySummary = new Map();

      sortedWeights
        .filter((record) => new Date(record.date) >= startMonth)
        .forEach((record) => {
          const key = getMonthKey(record.date);
          const current = monthlySummary.get(key) ?? { weightTotal: 0, weightCount: 0, intake: 0, burned: 0 };
          monthlySummary.set(key, {
            weightTotal: current.weightTotal + record.weight,
            weightCount: current.weightCount + 1,
            intake: current.intake,
            burned: current.burned,
          });
        });

      sortedCalories
        .filter((trend) => new Date(trend.date) >= startMonth)
        .forEach((trend) => {
          const key = getMonthKey(trend.date);
          const current = monthlySummary.get(key) ?? { weightTotal: 0, weightCount: 0, intake: 0, burned: 0 };
          monthlySummary.set(key, {
            ...current,
            intake: current.intake + trend.intakeCalories,
            burned: current.burned + trend.burnedCalories,
          });
        });

      return monthKeys.map((key) => {
        const summary = monthlySummary.get(key);
        return {
          date: key,
          weight: summary && summary.weightCount ? +(summary.weightTotal / summary.weightCount).toFixed(1) : null,
          intakeCalories: summary?.intake ?? null, // 月次は合計カロリーを表示
          burnedCalories: summary?.burned ?? null,
        };
      });
    }

    const days = period === "7d" ? 7 : 30;
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const weightByDate = new Map();
    sortedWeights
      .filter((record) => new Date(record.date) >= startDate)
      .forEach((record) => {
        weightByDate.set(record.date, record.weight);
      });

    const calorieByDate = new Map();
    sortedCalories
      .filter((trend) => new Date(trend.date) >= startDate)
      .forEach((trend) => {
        calorieByDate.set(trend.date, {
          intakeCalories: trend.intakeCalories,
          burnedCalories: trend.burnedCalories,
        });
      });

    const rows = [];
    for (let cursor = new Date(startDate); cursor <= latestDate; cursor.setDate(cursor.getDate() + 1)) {
      const key = dateKeyFromDate(cursor);
      const calorie = calorieByDate.get(key);
      rows.push({
        date: key,
        weight: weightByDate.get(key) ?? null,
        intakeCalories: calorie?.intakeCalories ?? (hasCalorieData ? null : undefined),
        burnedCalories: calorie?.burnedCalories ?? (hasCalorieData ? null : undefined),
      });
    }

    return rows;
  }, [latestDate, records, calorieTrends, period, monthKeys, hasCalorieData]);

  const calorieStats = useMemo(() => {
    if (!hasCalorieData || !chartData.length) return { avgIntake: null, avgBurned: null, diff: null };

    const validRows = chartData.filter(
      (row) => Number.isFinite(row.intakeCalories) && Number.isFinite(row.burnedCalories),
    );
    if (!validRows.length) return { avgIntake: null, avgBurned: null, diff: null };

    const totals = validRows.reduce(
      (acc, row) => ({
        intake: acc.intake + row.intakeCalories,
        burned: acc.burned + row.burnedCalories,
      }),
      { intake: 0, burned: 0 },
    );

    const avgIntake = Math.round(totals.intake / validRows.length);
    const avgBurned = Math.round(totals.burned / validRows.length);
    return { avgIntake, avgBurned, diff: avgIntake - avgBurned };
  }, [chartData, hasCalorieData]);

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
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tickFormatter={tickFormatter} />
                <YAxis unit=" kg" tickCount={6} domain={["auto", "auto"]} />
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

          {hasCalorieData && (
            <div className="trend-section">
              <div className="trend-section-header">
                <h3 className="trend-subtitle">摂取・消費カロリー</h3>
                <p className="muted small">棒グラフで日/週/月ごとのバランス</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tickFormatter={tickFormatter} />
                  <YAxis unit=" kcal" tickCount={6} />
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
