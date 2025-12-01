import React from "react";

/**
 * @typedef TodaySummaryCardProps
 * @property {number} todayIntake
 * @property {number} todayBurn
 * @property {number} targetBurn
 * @property {number} currentWeight
 * @property {number} yesterdayWeight
 * @property {number} targetWeight
 * @property {() => void} [onEditProfile]
 */

/**
 * Dashboard summary of intake, burn, and weight with simple card layout.
 * @param {TodaySummaryCardProps} props
 */
export default function TodaySummaryCard({
  todayIntake,
  todayBurn,
  targetBurn,
  currentWeight,
  yesterdayWeight,
  targetWeight,
  onEditProfile,
}) {
  const diff =
    Number.isFinite(currentWeight) && Number.isFinite(yesterdayWeight)
      ? currentWeight - yesterdayWeight
      : null;

  const formatKcal = (value) => (Number.isFinite(value) ? `${Math.round(value)} kcal` : "-- kcal");
  const formatWeight = (value) =>
    Number.isFinite(value) ? `${Number(value).toFixed(1)} kg` : "-- kg";

  const weightDiffText = (() => {
    if (!Number.isFinite(diff)) return "（昨日の記録なし）";
    const sign = diff > 0 ? "+" : "";
    return `（昨日より ${sign}${diff.toFixed(1)} kg）`;
  })();

  const cardStyle = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flex: "1 1 240px",
    minWidth: 240,
  };

  const titleStyle = { margin: "0 0 8px", fontSize: 16, fontWeight: 700 };
  const valueStyle = { margin: "6px 0", fontSize: 18, fontWeight: 600 };
  const labelStyle = { color: "#555", fontSize: 13 };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>今日のサマリー</h2>
        {onEditProfile ? (
          <button type="button" onClick={onEditProfile} style={buttonStyle}>
            プロファイル編集
          </button>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3 style={titleStyle}>摂取カロリー</h3>
          <div style={labelStyle}>今日の記録：</div>
          <div style={valueStyle}>{formatKcal(todayIntake)}</div>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>消費カロリー</h3>
          <div style={labelStyle}>今日の記録：</div>
          <div style={valueStyle}>{formatKcal(todayBurn)}</div>
          <div style={labelStyle}>目標消費カロリー：</div>
          <div style={valueStyle}>{formatKcal(targetBurn)}</div>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>体重</h3>
          <div style={labelStyle}>現在の体重：</div>
          <div style={valueStyle}>{formatWeight(currentWeight)}</div>
          <div style={{ ...labelStyle, margin: "4px 0" }}>{weightDiffText}</div>
          <div style={labelStyle}>目標体重：</div>
          <div style={valueStyle}>{formatWeight(targetWeight)}</div>
        </div>
      </div>
    </section>
  );
}

const buttonStyle = {
  padding: "8px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
