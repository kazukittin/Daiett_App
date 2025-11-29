import React, { useState } from "react";

const initialFormState = {
  weightKg: "",
  heightCm: "",
  age: "",
  sex: "male",
  activityLevel: "moderate",
  goal: "maintain",
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
        throw new Error(data.error || "Failed to get recommendation");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1rem" }}>
      <h2>Calorie Advisor</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Weight (kg)
          <input
            type="number"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleChange}
            min="0"
            step="0.1"
            required
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Height (cm)
          <input
            type="number"
            name="heightCm"
            value={formData.heightCm}
            onChange={handleChange}
            min="0"
            step="0.1"
            required
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Age
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="0"
            required
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Sex
          <select name="sex" value={formData.sex} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Activity Level
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
          >
            <option value="low">Low (almost sedentary)</option>
            <option value="light">Light (1–3 days/week)</option>
            <option value="moderate">Moderate (3–5 days/week)</option>
            <option value="high">High (6–7 days/week)</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Goal
          <select name="goal" value={formData.goal} onChange={handleChange}>
            <option value="lose">Lose</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Gain</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Get Recommendation"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h3>Daily Recommendations</h3>
          <p>
            <strong>BMR:</strong> {result.bmr} kcal
          </p>
          <p>
            <strong>TDEE:</strong> {result.tdee} kcal
          </p>
          <p>
            <strong>Target Calories:</strong> {result.targetCalories} kcal ({result.goal})
          </p>
        </div>
      )}
    </div>
  );
}
