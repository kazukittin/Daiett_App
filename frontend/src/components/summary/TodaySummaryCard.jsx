import React from "react";

/**
 * @typedef TodaySummaryCardProps
 * @property {number} dailyTargetCalories
 * @property {number} intakeCalories
 * @property {number} burnCalories
 * @property {number} remainingCalories
 * @property {number | null} currentWeight
 * @property {number | null} targetWeight
 */

/**
 * Compact dashboard card summarizing today's calorie balance and key weight metrics.
 * @param {TodaySummaryCardProps} props
 */
export default function TodaySummaryCard({
  dailyTargetCalories,
  intakeCalories,
  burnCalories,
  remainingCalories,
  currentWeight,
  targetWeight,
}) {
  const balanceIsNegative = remainingCalories < 0;
  const balanceLabel = balanceIsNegative ? "オーバー" : "残り";

  const formatValue = (value, unit) =>
    Number.isFinite(value) ? `${Number(value).toFixed(unit === "kcal" ? 0 : 1)} ${unit}` : "--";

  return (
    <section className="card today-summary-card">
      <div className="today-summary-header">
        <div>
          <h2>今日のサマリー</h2>
          <p className="muted">目標 {dailyTargetCalories} kcal</p>
        </div>
        <span className={`today-summary-pill ${balanceIsNegative ? "negative" : "positive"}`}>
          {balanceLabel} {Math.abs(remainingCalories)} kcal
        </span>
      </div>

      <div className="today-summary-grid">
        <SummaryStat
          label="摂取カロリー"
          value={formatValue(intakeCalories, "kcal")}
          helper="食事ログから計算"
        />
        <SummaryStat
          label="消費カロリー"
          value={formatValue(burnCalories, "kcal")}
          helper="運動記録の合計"
        />
        <SummaryStat
          label="残り目標"
          className={balanceIsNegative ? "negative" : ""}
          value={`${Math.abs(remainingCalories)} kcal`}
          helper={balanceIsNegative ? "目標を超えています" : "まだ余裕があります"}
        />
        <SummaryStat
          label="現在の体重"
          value={formatValue(currentWeight, "kg")}
          helper="最新の記録"
        />
        <SummaryStat
          label="目標体重"
          value={formatValue(targetWeight, "kg")}
          helper="設定した目標"
        />
      </div>
    </section>
  );
}

function SummaryStat({ label, value, helper, className = "" }) {
  return (
    <div className={`today-summary-stat ${className}`.trim()}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {helper ? <span className="stat-helper">{helper}</span> : null}
    </div>
  );
}
