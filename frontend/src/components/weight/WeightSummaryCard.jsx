import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";

/**
 * @typedef {Object} WeightSummaryCardProps
 * @property {number | null} currentWeight - 現在の体重
 * @property {number | null} targetWeight - 目標体重
 * @property {number | null} monthlyAverage - 今月の平均体重
 * @property {number | null} monthlyDiff - 先月比の変化量（マイナスは減量）
 */

/**
 * 値を kg 表記にフォーマットします。
 * @param {number | null} value
 * @returns {string}
 */
function formatWeight(value) {
  if (value || value === 0) {
    return `${value.toFixed(1)} kg`;
  }
  return "--";
}

/**
 * 月次変化の表示用文字列を返します。
 * @param {number | null} value
 * @returns {string}
 */
function formatMonthlyDiff(value) {
  if (value || value === 0) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)} kg`;
  }
  return "--";
}

/**
 * 月次変化のステータスを判定します。
 * @param {number | null} value
 * @returns {"good" | "bad" | "neutral"}
 */
function getMonthlyDiffStatus(value) {
  if (typeof value === "number") {
    if (value < 0) return "good"; // 体重が減った
    if (value > 0) return "bad"; // 体重が増えた
  }
  return "neutral";
}

/**
 * 体重サマリーカード
 * @param {WeightSummaryCardProps} props
 */
export default function WeightSummaryCard({
  currentWeight,
  targetWeight,
  monthlyAverage,
  monthlyDiff,
}) {
  const monthlyStatus = useMemo(() => getMonthlyDiffStatus(monthlyDiff), [monthlyDiff]);

  const metrics = useMemo(
    () => [
      { key: "current", label: "現在の体重", value: formatWeight(currentWeight) },
      { key: "target", label: "目標体重", value: formatWeight(targetWeight) },
      { key: "average", label: "今月の平均", value: formatWeight(monthlyAverage) },
      {
        key: "monthlyDiff",
        label: "月次の変化",
        value: formatMonthlyDiff(monthlyDiff),
        status: monthlyStatus,
      },
    ],
    [currentWeight, monthlyAverage, monthlyDiff, monthlyStatus, targetWeight],
  );

  return (
    <Card className="weight-summary-card" surfaceMuted>
      <div className="weight-summary-header">
        <div>
          <p className="weight-summary-eyebrow">体重サマリー</p>
          <h3 className="weight-summary-title">今の状態をざっくり確認</h3>
        </div>
      </div>

      <div className="weight-summary-grid">
        {metrics.map((metric) => (
          <SummaryItem key={metric.key} label={metric.label} value={metric.value} status={metric.status} />
        ))}
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, status = "neutral" }) {
  return (
    <div className={`weight-summary-item weight-summary-item--${status}`}>
      <span className="weight-summary-label">{label}</span>
      <span className="weight-summary-value">{value}</span>
    </div>
  );
}
