import React, { useEffect, useState } from "react";
import { fetchCalorieProfile, saveCalorieProfile } from "../api/calorieProfileApi.js";

const cardStyle = {
  maxWidth: 480,
  margin: "16px auto",
  padding: 16,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: "0.95rem",
  color: "#111827",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: "1rem",
};

const buttonStyle = {
  marginTop: 8,
  padding: "12px 14px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: "1rem",
  cursor: "pointer",
};

const initialState = {
  heightCm: "",
  age: "",
  sex: "male",
  activityLevel: "moderate",
  goal: "maintain",
};

export default function CalorieProfileSetup({ onProfileSaved, onProfileLoaded }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCalorieProfile()
      .then((profile) => {
        if (!active) return;
        if (profile) {
          onProfileLoaded?.(profile);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onProfileLoaded]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const heightCm = Number(form.heightCm);
    const age = Number(form.age);

    if (!heightCm || heightCm <= 0) {
      setError("身長を正しく入力してください。");
      return;
    }
    if (!age || age <= 0) {
      setError("年齢を正しく入力してください。");
      return;
    }

    const profile = {
      heightCm,
      age,
      sex: form.sex,
      activityLevel: form.activityLevel,
      goal: form.goal,
    };

    setSaving(true);
    setError("");
    try {
      const saved = await saveCalorieProfile(profile);
      onProfileSaved?.(saved);
    } catch (err) {
      setError(err.message || "プロファイルの保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={cardStyle}>プロファイルを確認しています...</div>;
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 12px" }}>カロリープロファイル設定</h3>
      <p style={{ margin: "0 0 12px", color: "#4b5563", lineHeight: 1.6 }}>
        目標や活動レベルなどの基礎情報を登録しておくと、体重を記録するたびに自動で消費カロリーと目標摂取カロリーを計算します。
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={labelStyle}>
          身長 (cm)
          <input
            type="number"
            name="heightCm"
            value={form.heightCm}
            onChange={handleChange}
            min="0"
            step="0.1"
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          年齢
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            min="0"
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          性別
          <select name="sex" value={form.sex} onChange={handleChange} style={inputStyle}>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </label>

        <label style={labelStyle}>
          活動レベル
          <select
            name="activityLevel"
            value={form.activityLevel}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="low">低い（ほぼ座りがち）</option>
            <option value="light">やや低い（週1-3回軽い運動）</option>
            <option value="moderate">ふつう（週3-5回運動）</option>
            <option value="high">高い（週6-7回激しい運動）</option>
          </select>
        </label>

        <label style={labelStyle}>
          目標
          <select name="goal" value={form.goal} onChange={handleChange} style={inputStyle}>
            <option value="lose">減量したい</option>
            <option value="maintain">維持したい</option>
            <option value="gain">増量したい</option>
          </select>
        </label>

        <button type="submit" style={buttonStyle} disabled={saving}>
          {saving ? "保存中..." : "プロファイルを保存する"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 10, color: "#b91c1c" }}>
          <strong>エラー:</strong> {error}
        </div>
      )}
    </div>
  );
}
