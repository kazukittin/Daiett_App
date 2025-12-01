import React, { useState } from "react";

const initialFormState = {
  weightKg: "",
  heightCm: "",
  age: "",
  sex: "male",
  activityLevel: "moderate",
  goal: "maintain",
};

const cardStyle = {
  maxWidth: "480px",
  margin: "16px auto",
  padding: 16,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "grid",
  gap: "4px",
  fontSize: "0.95rem",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #d0d7de",
  fontSize: "1rem",
};

const buttonStyle = {
  marginTop: 8,
  padding: "12px 14px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: "1rem",
  cursor: "pointer",
};

export default function CalorieAdvisor() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      weightKg: Number(formData.weightKg),
      heightCm: Number(formData.heightCm),
      age: Number(formData.age),
      sex: formData.sex,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
    };

    try {
      const response = await fetch("http://localhost:4000/api/calories/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "計算に失敗しました。");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 12px" }}>カロリー診断フォーム</h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
        <label style={labelStyle}>
          体重 (kg)
          <input
            type="number"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleChange}
            min="0"
            step="0.1"
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          身長 (cm)
          <input
            type="number"
            name="heightCm"
            value={formData.heightCm}
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
            value={formData.age}
            onChange={handleChange}
            min="0"
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          性別
          <select name="sex" value={formData.sex} onChange={handleChange} style={inputStyle}>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </label>

        <label style={labelStyle}>
          活動レベル
          <select
            name="activityLevel"
            value={formData.activityLevel}
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
          <select name="goal" value={formData.goal} onChange={handleChange} style={inputStyle}>
            <option value="lose">減量したい</option>
            <option value="maintain">維持したい</option>
            <option value="gain">増量したい</option>
          </select>
        </label>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "計算中..." : "目安を計算する"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#b91c1c", marginTop: "12px" }}>
          <strong>エラー:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            borderRadius: 8,
            border: "1px solid #f1d7a4",
            background: "#fdf6e3",
          }}
        >
          <h4 style={{ margin: "0 0 8px" }}>計算結果</h4>
          <p style={{ margin: "4px 0" }}>
            <strong>基礎代謝 (BMR):</strong> {result.bmr} kcal
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>推定消費カロリー (TDEE):</strong> {result.tdee} kcal
          </p>
        </div>
      )}
    </div>
  );
}
