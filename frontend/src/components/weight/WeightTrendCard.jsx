import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Card from "../ui/Card";
import { getMonthKey } from "../../utils/date";

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間", days: 7 },
  { key: "30d", label: "1か月", days: 30 },
  { key: "12m", label: "12か月", months: 12 },
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

const formatLabel = (value, period) => (period === "12m" ? formatMonthTick(value) : formatDayTick(value));

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

    if (period === "12m") {
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
      {noData ? (
        <div className="trend-placeholder">まだデータがありません。体重やカロリーを記録してみましょう。</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tickFormatter={tickFormatter} />
            <YAxis yAxisId="left" unit=" kg" tickCount={6} />
            <YAxis yAxisId="right" orientation="right" unit=" kcal" tickCount={6} />
            <Tooltip content={<TrendTooltip period={period} />} />
            <Legend />
            {hasCalorieData && (
              <>
                <Bar
                  yAxisId="right"
                  dataKey="intakeCalories"
                  name={period === "12m" ? "月間摂取" : "摂取カロリー"}
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Bar
                  yAxisId="right"
                  dataKey="burnedCalories"
                  name={period === "12m" ? "月間消費" : "消費カロリー"}
                  fill="#f6c343"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </>
            )}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              name={period === "12m" ? "平均体重" : "体重"}
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
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
