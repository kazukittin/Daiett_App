import React from "react";
import Card from "../ui/Card";
import { formatJapaneseDate } from "../../utils/date";

const WeightTrendCard = ({ records }) => {
  if (!records.length) {
    return (
      <Card title="体重トレンド">
        <p>まだデータがありません。まずは今日の体重を記録しましょう。</p>
      </Card>
    );
  }

  const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
  const weights = sorted.map((record) => Number(record.weight));
  const min = Math.min(...weights) - 0.3;
  const max = Math.max(...weights) + 0.3;

  const points = sorted.map((record, index) => {
    const x = (index / Math.max(sorted.length - 1, 1)) * 100;
    const range = max - min || 1;
    const y = ((max - record.weight) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <Card title="体重トレンド">
      <div className="weight-trend-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            points={points.join(" ")}
          />
        </svg>
      </div>
      <div className="flex-between">
        <small>{formatJapaneseDate(sorted[0].date)}</small>
        <small>{formatJapaneseDate(sorted[sorted.length - 1].date)}</small>
      </div>
    </Card>
  );
};

export default WeightTrendCard;
