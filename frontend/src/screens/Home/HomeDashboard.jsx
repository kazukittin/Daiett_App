import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import TodayMealHighlight from "../../components/meals/TodayMealHighlight.jsx";
import TodaySummaryCard from "../../components/summary/TodaySummaryCard.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useMealEntries } from "../../hooks/useMealEntries.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { getTodayISO } from "../../utils/date.js";

const DAILY_TARGET_CALORIES = 2000;

export default function HomeDashboard() {
  const navigate = useNavigate();

  const { weightRecords, latestRecord, targetWeight } = useWeightRecords();
  const { mealEntries } = useMealEntries();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const todayKey = getTodayISO();
  const calorieTrends = []; // TODO: wire calorie trend data when available

  const todayMealEntries = useMemo(
    () => mealEntries.filter((entry) => entry.date === todayKey),
    [mealEntries, todayKey],
  );

  const todayIntakeCalories = useMemo(
    () => todayMealEntries.reduce((total, entry) => total + (Number(entry.totalCalories) || 0), 0),
    [todayMealEntries],
  );

  const remainingCalories = DAILY_TARGET_CALORIES - todayIntakeCalories + todayBurnCalories;

  const handleAddWeightClick = () => {
    navigate("/weight/new");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">

        <section className="content-grid dashboard-layout">
          <div className="dashboard-top">
            <div className="dashboard-actions">
              <button type="button" className="btn primary" onClick={handleAddWeightClick}>
                体重を追加
              </button>
            </div>

            <TodaySummaryCard
              dailyTargetCalories={DAILY_TARGET_CALORIES}
              intakeCalories={todayIntakeCalories}
              burnCalories={todayBurnCalories}
              remainingCalories={remainingCalories}
              currentWeight={latestRecord?.weight ?? null}
              targetWeight={Number.isFinite(targetWeight) ? targetWeight : null}
            />
          </div>

          <div className="dashboard-middle">
            <TodayMealHighlight meals={todayMealEntries} totalCalories={todayIntakeCalories} />
            <TodayWorkout />
          </div>

          <div className="dashboard-bottom single-column">
            <WeightTrendCard records={weightRecords} calorieTrends={calorieTrends} />
          </div>
        </section>
      </main>
    </div>
  );
}
