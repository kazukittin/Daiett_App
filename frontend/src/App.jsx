import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import CalorieProfileSetup from "./components/CalorieProfileSetup.jsx";
import CalorieProfileSummary from "./components/CalorieProfileSummary.jsx";
import WeightDialog from "./components/WeightDialog.jsx";
import FitbitConnectCard from "./components/fitbit/FitbitConnectCard.jsx";
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

function HomeView({ onEditProfile }) {
  return (
    <Routes>
      <Route path="/" element={<HomeDashboard onEditProfile={onEditProfile} />} />
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

function ProfileView({ profile, profileLoaded, onProfileSaved, onEdit, error, infoMessage }) {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>プロファイル編集</h2>
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
          <FitbitConnectCard />
        </>
      )}
      {profileLoaded && !profile && <FitbitConnectCard />}
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
      setView("profile");
    } catch (err) {
      setProfileError(err.message || "プロファイルの削除に失敗しました。");
    }
  };

  const handleAddWeightClick = () => {
    if (!profileLoaded || !profile) {
      setView("profile");
      setCalorieNotice("まずカロリープロファイルを登録してください。");
      return;
    }
    setIsWeightModalOpen(true);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar
        activeView={view}
        onAddWeightClick={handleAddWeightClick}
        onNavigate={(nextView) => {
          setView(nextView);
        }}
      />
      <main style={{ flex: 1, padding: "16px 24px" }}>
        {view === "home" && <HomeView onEditProfile={() => setView("profile")} />}
        {view === "profile" && (
          <ProfileView
            profile={profile}
            profileLoaded={profileLoaded}
            onProfileSaved={handleProfileSaved}
            onEdit={handleEditProfile}
            error={profileError}
            infoMessage={calorieNotice}
          />
        )}
      </main>

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
