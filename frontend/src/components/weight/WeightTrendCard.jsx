import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import Card from "../ui/Card";
import { getMonthKey } from "../../utils/date";

const PERIOD_OPTIONS = [
  { key: "7d", label: "1週間", days: 7 },
  { key: "30d", label: "1か月", days: 30 },
  { key: "12m", label: "12か月", months: 12 },
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

const formatLabel = (value, period) =>
  period === "12m" ? formatMonthTick(value) : formatDayTick(value);

const CalorieTooltip = ({ active, payload, label, period }) => {
  if (!active || !payload || !payload.length) return null;

  const intake = payload.find((entry) => entry.dataKey === "intakeCalories")?.value ?? 0;
  const burned = payload.find((entry) => entry.dataKey === "burnedCalories")?.value ?? 0;
  const diff = intake - burned;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{formatLabel(label, period)}</p>
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

/**
 * @typedef {Object} WeightRecord
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} weight
 *
 * @typedef {Object} CalorieTrend
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} intakeCalories
 * @property {number} burnedCalories
 */

/**
 * @param {Object} props
 * @param {WeightRecord[]} props.records
 * @param {CalorieTrend[]} [props.calorieTrends]
 */
const WeightTrendCard = ({ records = [], calorieTrends = [] }) => {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0].key);
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

  const weightChartData = useMemo(() => {
    if (!latestDate || !records.length) return [];

    const sorted = [...records]
      .map((record) => ({ ...record, weight: Number(record.weight) }))
      .filter((record) => Number.isFinite(record.weight))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (period === "12m") {
      const startMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() - 11, 1);
      const monthlyTotals = new Map();

      sorted
        .filter((record) => new Date(record.date) >= startMonth)
        .forEach((record) => {
          const key = getMonthKey(record.date);
          const current = monthlyTotals.get(key) ?? { total: 0, count: 0 };
          monthlyTotals.set(key, {
            total: current.total + record.weight,
            count: current.count + 1,
          });
        });

      return monthKeys.map((key) => {
        const summary = monthlyTotals.get(key);
        return {
          date: key,
          weight: summary ? +(summary.total / summary.count).toFixed(1) : null,
        };
      });
    }

    const days = period === "7d" ? 7 : 30;
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    return sorted
      .filter((record) => new Date(record.date) >= startDate)
      .map((record) => ({ date: record.date, weight: record.weight }));
  }, [latestDate, records, period, monthKeys]);

  const calorieChartData = useMemo(() => {
    if (!latestDate || !calorieTrends.length) return [];

    const sorted = [...calorieTrends]
      .map((trend) => ({
        ...trend,
        intakeCalories: Number(trend.intakeCalories),
        burnedCalories: Number(trend.burnedCalories),
      }))
      .filter((trend) =>
        Number.isFinite(trend.intakeCalories) && Number.isFinite(trend.burnedCalories),
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (period === "12m") {
      const startMonth = new Date(latestDate.getFullYear(), latestDate.getMonth() - 11, 1);
      const monthlyTotals = new Map();

      sorted
        .filter((trend) => new Date(trend.date) >= startMonth)
        .forEach((trend) => {
          const key = getMonthKey(trend.date);
          const current = monthlyTotals.get(key) ?? { intake: 0, burned: 0 };
          monthlyTotals.set(key, {
            intake: current.intake + trend.intakeCalories,
            burned: current.burned + trend.burnedCalories,
          });
        });

      return monthKeys.map((key) => {
        const summary = monthlyTotals.get(key);
        return {
          date: key,
          intakeCalories: summary?.intake ?? null,
          burnedCalories: summary?.burned ?? null,
        };
      });
    }

    const days = period === "7d" ? 7 : 30;
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    return sorted
      .filter((trend) => new Date(trend.date) >= startDate)
      .map((trend) => ({
        date: trend.date,
        intakeCalories: trend.intakeCalories,
        burnedCalories: trend.burnedCalories,
      }));
  }, [latestDate, calorieTrends, period, monthKeys]);

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

  return (
    <Card title="体重トレンド" action={renderRangeButtons()} className="weight-trend-card">
      <div className="trend-section">
        <h4 className="trend-subtitle">体重推移</h4>
        {weightChartData.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weightChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tickFormatter={tickFormatter} />
              <YAxis unit=" kg" tickCount={6} />
              <Tooltip labelFormatter={tickFormatter} formatter={(value) => [`${value} kg`, "体重"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                name="体重"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="trend-placeholder">
            まだデータがありません。まずは今日の体重を記録しましょう。
          </div>
        )}
      </div>

      <div className="trend-section">
        <h4 className="trend-subtitle">摂取 / 消費カロリー</h4>
        {calorieTrends.length ? (
          calorieChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={calorieChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tickFormatter={tickFormatter} />
                <YAxis unit=" kcal" tickCount={6} />
                <Tooltip content={<CalorieTooltip period={period} />} />
                <Legend />
                <Bar dataKey="intakeCalories" name="摂取カロリー" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="burnedCalories" name="消費カロリー" fill="#f6c343" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="trend-placeholder">選択期間のカロリーデータがありません。</div>
          )
        ) : (
          <div className="trend-placeholder">カロリーデータがありません。</div>
        )}
      </div>
    </Card>
  );
};

export default WeightTrendCard;
