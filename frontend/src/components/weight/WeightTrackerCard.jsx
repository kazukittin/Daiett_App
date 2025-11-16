import React, { useEffect, useMemo, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getTodayISO } from "../../utils/date";
import { isValidWeight } from "../../utils/weight";

const WeightTrackerCard = ({ onSave, latestRecord, previousRecord }) => {
  const [date, setDate] = useState(getTodayISO());
  const [weight, setWeight] = useState(latestRecord?.weight ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (latestRecord?.date === date) {
      setWeight(latestRecord.weight);
    }
  }, [latestRecord, date]);

  const comparisonWeight = useMemo(() => {
    if (!latestRecord) return null;
    if (latestRecord.date === date) {
      return previousRecord?.weight ?? null;
    }
    return latestRecord.weight;
  }, [date, latestRecord, previousRecord]);

  const difference = useMemo(() => {
    if (comparisonWeight == null || weight === "") return null;
    return Number(weight) - Number(comparisonWeight);
  }, [comparisonWeight, weight]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!date) {
      setError("日付を入力してください。");
      return;
    }
    if (!isValidWeight(weight)) {
      setError("体重は数値で入力してください (例: 62.5)");
      return;
    }
    setError("");
    onSave({ date, weight: Number(weight) });
  };

  return (
    <Card title="今日の体重を記録">
      <form className="weight-form" onSubmit={handleSubmit}>
        <div className="weight-form-row">
          <div className="form-control">
            <label>日付</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div className="form-control">
            <label>体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="62.8"
            />
          </div>
        </div>

        {difference !== null && (
          <div className={difference >= 0 ? "trend-negative" : "trend-positive"}>
            直近との差: {difference > 0 ? "+" : ""}
            {difference.toFixed(1)} kg
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <div>
          <Button type="submit">今日の記録を保存</Button>
        </div>
      </form>
    </Card>
  );
};

export default WeightTrackerCard;
