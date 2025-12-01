import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import CalorieProfileSetup from "./components/CalorieProfileSetup.jsx";
import CalorieProfileSummary from "./components/CalorieProfileSummary.jsx";
import WeightDialog from "./components/WeightDialog.jsx";
import FitbitConnectCard from "./components/fitbit/FitbitConnectCard.jsx";
import { fetchCalorieProfile } from "./api/calorieProfileApi.js";
import HomeDashboard from "./screens/Home/HomeDashboard.jsx";
import IntakeDashboard from "./screens/Intake/IntakeDashboard.jsx";
import BurnDashboard from "./screens/Burn/BurnDashboard.jsx";
import AddMeal from "./screens/Meals/AddMeal.jsx";
import MealHistory from "./screens/Meals/MealHistory.jsx";
import ExerciseHistory from "./screens/Exercises/ExerciseHistory.jsx";
import AddExercise from "./screens/Exercises/AddExercise.jsx";
import AddWeight from "./screens/Weight/AddWeight.jsx";
import WorkoutSettings from "./screens/Settings/WorkoutSettings.jsx";

function ProfileView({
  profile,
  profileLoaded,
  onProfileSaved,
  onEdit,
  error,
  infoMessage,
  isEditing,
  onFinishEdit,
}) {
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
      {profileLoaded && (isEditing || (!profile && !error)) && (
        <CalorieProfileSetup
          onProfileSaved={(next) => {
            onProfileSaved(next);
            onFinishEdit?.();
          }}
          onProfileLoaded={onProfileSaved}
        />
      )}
      {profileLoaded && profile && !isEditing && (
        <>
          <CalorieProfileSummary profile={profile} onEdit={onEdit} />
          <FitbitConnectCard />
        </>
      )}
      {profileLoaded && !profile && !isEditing && <FitbitConnectCard />}
    </section>
  );
}

function ProfileEditDialog({ open, onClose, onProfileSaved }) {
  if (!open) return null;

  const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 999,
  };

  const dialogStyle = {
    width: "min(520px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
  };

  return (
    <div style={backdropStyle}>
      <div style={dialogStyle}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              padding: "4px 8px",
            }}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <CalorieProfileSetup
          onProfileSaved={(next) => {
            onProfileSaved?.(next);
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [calorieNotice, setCalorieNotice] = useState("");

  const activeView = useMemo(() => {
    if (location.pathname.startsWith("/profile")) return "profile";
    if (location.pathname.startsWith("/intake")) return "intake";
    if (location.pathname.startsWith("/burn")) return "burn";
    if (location.pathname.startsWith("/settings/workouts")) return "settings/workouts";
    return "home";
  }, [location.pathname]);

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
    setIsEditingProfile(false);
    setIsProfileDialogOpen(false);
  };

  const handleEditProfile = () => {
    setProfileError("");
    setIsEditingProfile(true);
    setIsProfileDialogOpen(true);
    navigate("/profile");
  };

  const handleAddWeightClick = () => {
    if (!profileLoaded || !profile) {
      navigate("/profile");
      setCalorieNotice("まずカロリープロファイルを登録してください。");
      return;
    }
    setIsWeightModalOpen(true);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar
        activeView={activeView}
        onAddWeightClick={handleAddWeightClick}
        onNavigate={(nextView) => {
          if (nextView === "profile") {
            setIsEditingProfile(false);
            navigate("/profile");
            return;
          }
          navigate(nextView === "home" ? "/" : nextView);
        }}
      />
      <main style={{ flex: 1, padding: "16px 24px" }}>
        <Routes>
          <Route
            path="/"
            element={<HomeDashboard onEditProfile={handleEditProfile} profile={profile} />}
          />
          <Route path="/intake" element={<IntakeDashboard />} />
          <Route path="/burn" element={<BurnDashboard />} />
          <Route path="/meals/new" element={<AddMeal />} />
          <Route path="/meals/history" element={<MealHistory />} />
          <Route path="/exercises/history" element={<ExerciseHistory />} />
          <Route path="/weight/new" element={<AddWeight />} />
          <Route path="/exercises/new" element={<AddExercise />} />
          <Route path="/settings/workouts" element={<WorkoutSettings />} />
          <Route
            path="/profile"
            element={
              <ProfileView
                profile={profile}
                profileLoaded={profileLoaded}
                onProfileSaved={handleProfileSaved}
                onEdit={handleEditProfile}
                error={profileError}
                infoMessage={calorieNotice}
                isEditing={isEditingProfile}
                onFinishEdit={() => setIsEditingProfile(false)}
              />
            }
          />
        </Routes>
      </main>

      {isWeightModalOpen && (
        <WeightDialog
          onClose={() => setIsWeightModalOpen(false)}
          onSaved={() => {
            setIsWeightModalOpen(false);
          }}
        />
      )}

      <ProfileEditDialog
        open={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setIsEditingProfile(false);
        }}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}
