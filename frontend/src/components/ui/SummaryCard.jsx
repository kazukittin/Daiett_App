import React from "react";

const SummaryCard = ({ label, value, helper, trend }) => {
  return (
    <div className="summary-card">
      <small>{label}</small>
      <div className="summary-value">{value}</div>
      {helper && <small>{helper}</small>}
      {typeof trend === "number" && (
        <span className={trend >= 0 ? "trend-positive" : "trend-negative"}>
          {trend > 0 ? "+" : ""}
          {trend.toFixed(1)} kg
        </span>
      )}
    </div>
  );
};

export default SummaryCard;
