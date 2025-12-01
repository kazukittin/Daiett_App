import React, { useState } from "react";
import WeightTrackerCard from "./weight/WeightTrackerCard.jsx";

const resultBoxStyle = {
  marginTop: 16,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#f8fafc",
  lineHeight: 1.6,
};

const targetHighlight = {
  fontSize: "1.05rem",
  fontWeight: 700,
};

const errorStyle = {
  marginTop: 12,
  color: "#b91c1c",
};

export default function WeightLog({ onSave, latestRecord, previousRecord, profile }) {
  const [calorieResult, setCalorieResult] = useState(null);
  const [calorieError, setCalorieError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async ({ date, weight }) => {
    setCalorieError("");
    setCalorieResult(null);

    try {
      await onSave({ date, weight });
    } catch (error) {
      setCalorieError(error?.message || "体重の保存に失敗しました。");
      return;
    }

    if (!profile) {
      setCalorieError("カロリープロファイルが未設定です。カロリー診断ページで設定してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/calories/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: weight,
          heightCm: profile.heightCm,
          age: profile.age,
          sex: profile.sex,
          activityLevel: profile.activityLevel,
          goal: profile.goal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "カロリー計算に失敗しました。");
      }
      setCalorieResult(data);
    } catch (error) {
      setCalorieError(error.message || "カロリー計算に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <WeightTrackerCard onSave={handleSave} latestRecord={latestRecord} previousRecord={previousRecord} />

      {calorieError && <div style={errorStyle}>{calorieError}</div>}

      {calorieResult && (
        <div style={resultBoxStyle}>
          <div style={{ marginBottom: 6 }}>最新の体重で計算した目安</div>
          <div>推定消費カロリー (TDEE): {calorieResult.tdee} kcal</div>
        </div>
      )}

      {loading && <div style={{ marginTop: 8, color: "#4b5563" }}>計算中...</div>}
    </div>
  );
}
