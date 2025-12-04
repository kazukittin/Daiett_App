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
 * Dashboard summary of intake, burn, and weight with enhanced visual design.
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

  const formatKcal = (value) => (Number.isFinite(value) ? `${Math.round(value)}` : "--");
  const formatWeight = (value) =>
    Number.isFinite(value) ? `${Number(value).toFixed(1)}` : "--";

  const weightDiffText = (() => {
    if (!Number.isFinite(diff)) return "昨日の記録なし";
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)} kg`;
  })();

  const burnProgress = Number.isFinite(todayBurn) && Number.isFinite(targetBurn) && targetBurn > 0
    ? Math.min((todayBurn / targetBurn) * 100, 100)
    : 0;

  const cardStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    flex: "1 1 280px",
    minWidth: 280,
    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "default",
  };

  const cardHoverStyle = {
    ...cardStyle,
    cursor: "pointer",
  };

  const titleStyle = {
    margin: "0 0 16px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const valueStyle = {
    margin: "0",
    fontSize: "2.5rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #3f8a62 0%, #2e6a4c 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const labelStyle = {
    color: "#9ca3af",
    fontSize: "0.8rem",
    marginTop: "4px",
  };

  const badgeStyle = (isPositive) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginTop: "8px",
    background: isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
    color: isPositive ? "#10b981" : "#ef4444",
  });

  const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3f8a62" />
            <stop offset="100%" stopColor="#2e6a4c" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <section className="slide-in-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>今日のサマリー</h2>
        {onEditProfile && (
          <button
            type="button"
            onClick={onEditProfile}
            className="btn secondary btn-hover"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
            }}
          >
            プロファイル編集
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Intake Card */}
        <div className="card-interactive" style={cardStyle}>
          <h3 style={titleStyle}>摂取カロリー</h3>
          <div style={valueStyle}>{formatKcal(todayIntake)}</div>
          <div style={labelStyle}>kcal</div>
        </div>

        {/* Burn Card with Progress Ring */}
        <div className="card-interactive" style={cardStyle}>
          <h3 style={titleStyle}>消費カロリー</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative" }}>
              <ProgressRing progress={burnProgress} />
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#3f8a62",
              }}>
                {Math.round(burnProgress)}%
              </div>
            </div>
            <div>
              <div style={{ ...valueStyle, fontSize: "1.8rem" }}>{formatKcal(todayBurn)}</div>
              <div style={labelStyle}>/ {formatKcal(targetBurn)} kcal</div>
            </div>
          </div>
        </div>

        {/* Weight Card */}
        <div className="card-interactive" style={cardStyle}>
          <h3 style={titleStyle}>体重</h3>
          <div style={valueStyle}>{formatWeight(currentWeight)}</div>
          <div style={labelStyle}>kg</div>
          <div style={badgeStyle(diff !== null && diff <= 0)}>
            {weightDiffText}
          </div>
          <div style={{ marginTop: 12, fontSize: "0.8rem", color: "#9ca3af" }}>
            目標: {formatWeight(targetWeight)} kg
          </div>
        </div>
      </div>
    </section>
  );
}

