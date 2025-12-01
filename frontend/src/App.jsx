import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import CalorieProfileSetup from "./components/CalorieProfileSetup.jsx";
import CalorieProfileSummary from "./components/CalorieProfileSummary.jsx";
import WeightDialog from "./components/WeightDialog.jsx";
import { fetchCalorieProfile, clearCalorieProfile } from "./api/calorieProfileApi.js";
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

function CalorieView({ profile, profileLoaded, onProfileSaved, onEdit, error, onOpenWeightDialog, infoMessage }) {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>カロリー診断</h2>
      <p style={{ color: "#374151", lineHeight: 1.6 }}>
        プロファイル登録後は、モーダルの体重入力から毎日の推定消費カロリーと目標摂取カロリーを計算できます。
      </p>
      {infoMessage && (
        <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", padding: 10, borderRadius: 8, marginTop: 8 }}>
          {infoMessage}
        </div>
      )}
      {!profileLoaded && <div>プロファイルを読み込み中です...</div>}
      {error && <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div>}
      {profileLoaded && !profile && !error && (
        <CalorieProfileSetup onProfileSaved={onProfileSaved} onProfileLoaded={onProfileSaved} />
      )}
      {profileLoaded && profile && (
        <>
          <CalorieProfileSummary profile={profile} onEdit={onEdit} />
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={onOpenWeightDialog}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              体重を追加
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [calorieNotice, setCalorieNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchCalorieProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err?.message?.includes("404")) {
          setProfile(null);
        } else {
          setProfileError(err.message || "プロファイルの取得に失敗しました。");
        }
      })
      .finally(() => {
        if (active) setProfileLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleProfileSaved = (nextProfile) => {
    setProfile(nextProfile);
    setProfileError("");
    setProfileLoaded(true);
    setCalorieNotice("");
  };

  const handleEditProfile = async () => {
    setProfileError("");
    try {
      await clearCalorieProfile();
      setProfile(null);
      setView("calorie");
    } catch (err) {
      setProfileError(err.message || "プロファイルの削除に失敗しました。");
    }
  };

  const handleAddWeightClick = () => {
    if (!profileLoaded || !profile) {
      setView("calorie");
      setCalorieNotice("まずカロリープロファイルを登録してください。");
      return;
    }
    setIsWeightModalOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header view={view} onChange={setView} />
      <div style={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
        <Sidebar onAddWeightClick={handleAddWeightClick} onNavigate={(path) => navigate(path)} />
        <main style={{ flex: 1, padding: "16px 24px" }}>
          {view === "home" ? (
            <HomeView />
          ) : (
            <CalorieView
              profile={profile}
              profileLoaded={profileLoaded}
              onProfileSaved={handleProfileSaved}
              onEdit={handleEditProfile}
              error={profileError}
              onOpenWeightDialog={handleAddWeightClick}
              infoMessage={calorieNotice}
            />
          )}
        </main>
      </div>

      {isWeightModalOpen && (
        <WeightDialog
          onClose={() => setIsWeightModalOpen(false)}
          onSaved={() => {
            setIsWeightModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
