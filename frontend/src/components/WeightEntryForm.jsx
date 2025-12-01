import React, { useEffect, useState } from "react";
import { fetchCalorieProfile } from "../api/calorieProfileApi.js";
import { getTodayISO } from "../utils/date.js";

const cardStyle = {
  maxWidth: 480,
  margin: "16px auto",
  padding: 16,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const resultCardStyle = {
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const modalCardStyle = {
  ...cardStyle,
  margin: 0,
  width: "100%",
  maxWidth: 520,
};

export default function WeightEntryForm({ profile: initialProfile, onLogged, mode = "inline" }) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => getTodayISO());
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calorieResult, setCalorieResult] = useState(null);
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCalorieResult(null);

    const weightValue = Number(weight);
    if (Number.isNaN(weightValue) || weightValue <= 0) {
      setError("体重は正の数値で入力してください。");
      return;
    }

    setLoading(true);
    try {
      // 1. Save weight
      const weightResponse = await fetch("http://localhost:4000/api/weight/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: weightValue, date, timeOfDay }),
      });

      if (!weightResponse.ok) {
        const err = await weightResponse.json().catch(() => ({}));
        throw new Error(err?.error || "体重の記録に失敗しました。");
      }

      // 2. Ensure profile is loaded
      let workingProfile = profile;
      if (!workingProfile) {
        const fetched = await fetchCalorieProfile();
        workingProfile = fetched;
        setProfile(fetched);
      }

      let calorieData = null;
      if (workingProfile) {
        const calorieResponse = await fetch(
          "http://localhost:4000/api/calories/recommendation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              weightKg: weightValue,
              heightCm: workingProfile.heightCm,
              age: workingProfile.age,
              sex: workingProfile.sex,
              activityLevel: workingProfile.activityLevel,
              goal: workingProfile.goal,
            }),
          },
        );

        const data = await calorieResponse.json();
        if (!calorieResponse.ok) {
          throw new Error(data?.error || "カロリー計算に失敗しました。");
        }
        calorieData = data;
        setCalorieResult(data);
      } else {
        setError("カロリープロファイルが未設定です。先に登録してください。");
      }

      onLogged?.({ weightKg: weightValue, calorieResult: calorieData, date, timeOfDay });
      setWeight("");
    } catch (err) {
      setError(err.message || "処理に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const effectiveCardStyle = mode === "modal" ? modalCardStyle : cardStyle;

  return (
    <div style={effectiveCardStyle}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>日付</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>測定タイミング</span>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="radio" value="morning" checked={timeOfDay === "morning"} onChange={(e) => setTimeOfDay(e.target.value)} />
            <span>朝</span>
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="radio" value="night" checked={timeOfDay === "night"} onChange={(e) => setTimeOfDay(e.target.value)} />
            <span>夜</span>
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>体重 (kg)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid #d1d5db" }}
            placeholder="例: 62.5"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "記録中..." : "記録する"}
        </button>
      </form>

      {error && <div style={{ color: "#b91c1c", marginTop: 10 }}>{error}</div>}

      {calorieResult && (
        <div style={resultCardStyle}>
          <div style={{ marginBottom: 6 }}>最新の体重で計算した目安</div>
          {calorieResult.bmr !== undefined && (
            <div>基礎代謝 (BMR): {calorieResult.bmr} kcal</div>
          )}
          <div>推定消費カロリー (TDEE): {calorieResult.tdee} kcal</div>
        </div>
      )}
    </div>
  );
}
