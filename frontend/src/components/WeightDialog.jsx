import React, { useState } from "react";

export default function WeightDialog({ onClose, onSaved }) {
  const [weight, setWeight] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const weightValue = Number(weight);
    if (!timeOfDay) {
      setError("朝か夜のどちらかを選択してください。");
      return;
    }
    if (Number.isNaN(weightValue) || weightValue <= 0) {
      setError("体重は正の数値で入力してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/weight/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: weightValue, timeOfDay }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "体重の登録に失敗しました。");
      }

      onSaved?.({ weightKg: weightValue, timeOfDay });
      onClose?.();
    } catch (err) {
      setError(err.message || "処理に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 40,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 12px" }}>体重を追加</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>測定タイミング</span>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="timeOfDay"
                value="morning"
                checked={timeOfDay === "morning"}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
              <span>朝</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="timeOfDay"
                value="night"
                checked={timeOfDay === "night"}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
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

          {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                minWidth: 96,
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                minWidth: 96,
              }}
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
