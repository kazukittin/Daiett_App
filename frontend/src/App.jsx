import React, { useState } from "react";
import CalorieAdvisor from "./components/CalorieAdvisor.jsx";

function Header({ view, onChange }) {
  const baseButtonStyle = {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #444",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    marginLeft: 8,
    minWidth: 96,
  };

  const activeStyle = {
    background: "#fff",
    color: "#111",
    borderColor: "#fff",
  };

  return (
    <header
      style={{
        background: "#222",
        color: "#fff",
        padding: "14px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>Daiett App</div>
          <div style={{ fontSize: "0.9rem", color: "#d1d5db" }}>Local diet tracking</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => onChange("home")}
            style={{
              ...baseButtonStyle,
              ...(view === "home" ? activeStyle : {}),
            }}
          >
            ホーム
          </button>
          <button
            type="button"
            onClick={() => onChange("calorie")}
            style={{
              ...baseButtonStyle,
              ...(view === "calorie" ? activeStyle : {}),
            }}
          >
            カロリー診断
          </button>
        </div>
      </div>
    </header>
  );
}

function HomeView() {
  return (
    <section
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>ホーム</h2>
      <p style={{ marginBottom: 0 }}>ここに既存のホーム画面が来る想定です。</p>
    </section>
  );
}

function CalorieView() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>カロリー診断</h2>
      <p style={{ color: "#374151" }}>
        現在の体重・身長・年齢・活動レベルから、1日の消費カロリーと摂取カロリーの目安を計算します。
      </p>
      <CalorieAdvisor />
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header view={view} onChange={setView} />
      <main style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
        {view === "home" ? <HomeView /> : <CalorieView />}
      </main>
    </div>
  );
}
