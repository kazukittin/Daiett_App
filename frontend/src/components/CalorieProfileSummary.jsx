import React from "react";

const cardStyle = {
  maxWidth: 480,
  margin: "16px auto",
  padding: 16,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const rowStyle = { display: "flex", justifyContent: "space-between", margin: "6px 0" };
const labelStyle = { color: "#6b7280" };

export default function CalorieProfileSummary({ profile, onEdit }) {
  if (!profile) return null;

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 8px" }}>登録済みプロファイル</h3>
      <p style={{ margin: "0 0 12px", color: "#4b5563" }}>
        以下の設定を使って、体重を記録するたびに自動計算します。
      </p>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={rowStyle}>
          <span style={labelStyle}>身長</span>
          <strong>{profile.heightCm} cm</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>年齢</span>
          <strong>{profile.age} 歳</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>性別</span>
          <strong>{profile.sex === "male" ? "男性" : "女性"}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>活動レベル</span>
          <strong>{profile.activityLevel}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>目標</span>
          <strong>{profile.goal === "lose" ? "減量" : profile.goal === "gain" ? "増量" : "維持"}</strong>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>目標体重</span>
          <strong>{profile.targetWeight != null ? `${profile.targetWeight} kg` : "未設定"}</strong>
        </div>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#f3f4f6",
            cursor: "pointer",
          }}
        >
          プロファイルを編集する
        </button>
      )}
    </div>
  );
}
