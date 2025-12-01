import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import CalorieProfileSetup from "./components/CalorieProfileSetup.jsx";
import { clearCalorieProfile, getCalorieProfile } from "./utils/calorieProfile";
import HomeDashboard from "./screens/Home/HomeDashboard.jsx";
import IntakeDashboard from "./screens/Intake/IntakeDashboard.jsx";
import BurnDashboard from "./screens/Burn/BurnDashboard.jsx";
import AddMeal from "./screens/Meals/AddMeal.jsx";
import MealHistory from "./screens/Meals/MealHistory.jsx";
import ExerciseHistory from "./screens/Exercises/ExerciseHistory.jsx";
import AddExercise from "./screens/Exercises/AddExercise.jsx";
import AddWeight from "./screens/Weight/AddWeight.jsx";
import WorkoutSettings from "./screens/Settings/WorkoutSettings.jsx";

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
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
    <Routes>
      <Route path="/" element={<HomeDashboard />} />
      <Route path="/intake" element={<IntakeDashboard />} />
      <Route path="/burn" element={<BurnDashboard />} />
      <Route path="/meals/new" element={<AddMeal />} />
      <Route path="/meals/history" element={<MealHistory />} />
      <Route path="/exercises/history" element={<ExerciseHistory />} />
      <Route path="/weight/new" element={<AddWeight />} />
      <Route path="/exercises/new" element={<AddExercise />} />
      <Route path="/settings/workouts" element={<WorkoutSettings />} />
    </Routes>
  );
}

function SummaryCard({ profile, onEdit }) {
  const rowStyle = { display: "flex", justifyContent: "space-between", margin: "6px 0" };
  const labelStyle = { color: "#6b7280" };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "16px auto",
        padding: 16,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
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
          <strong>
            {profile.goal === "lose" ? "減量" : profile.goal === "gain" ? "増量" : "維持"}
          </strong>
        </div>
      </div>

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
    </div>
  );
}

function CalorieView({ profile, onProfileSaved, onEdit }) {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>カロリー診断</h2>
      <p style={{ color: "#374151", lineHeight: 1.6 }}>
        現在の体重を記録するたびに、登録したプロファイルを使って推定消費カロリーと目標摂取カロリーを自動計算します。
      </p>
      {profile ? (
        <SummaryCard profile={profile} onEdit={onEdit} />
      ) : (
        <CalorieProfileSetup onProfileSaved={onProfileSaved} />
      )}
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [profile, setProfile] = useState(() => getCalorieProfile());

  const handleProfileSaved = (nextProfile) => setProfile(nextProfile);
  const handleEditProfile = () => {
    clearCalorieProfile();
    setProfile(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header view={view} onChange={setView} />
      <main style={{ padding: "16px 24px" }}>
        {view === "home" ? (
          <HomeView />
        ) : (
          <CalorieView
            profile={profile}
            onProfileSaved={handleProfileSaved}
            onEdit={handleEditProfile}
          />
        )}
      </main>
    </div>
  );
}
