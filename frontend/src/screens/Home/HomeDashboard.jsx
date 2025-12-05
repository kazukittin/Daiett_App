import React, { useEffect, useMemo, useState } from "react";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import TodayMealHighlight from "../../components/meals/TodayMealHighlight.jsx";
import TodaySummaryCard from "../../components/summary/TodaySummaryCard.jsx";
import StreakCard from "../../components/gamification/StreakCard.jsx";
import QuickStats from "../../components/summary/QuickStats.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";
import { useStreak } from "../../hooks/useStreak.js";
import { getMealSummary } from "../../api/meals.js";
import { getTodayISO } from "../../utils/date.js";

import WaterTracker from "../../components/water/WaterTracker.jsx";

export default function HomeDashboard({ onEditProfile, profile }) {
  // Weight summaries and trend data come from backend APIs via hooks.
  const { weightRecords, latestRecord, previousRecord, targetWeight } = useWeightRecords();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const { trend, period, setPeriod } = useWeightTrend();
  const streakData = useStreak();
  const todayKey = getTodayISO();
  const [mealSummary, setMealSummary] = useState({ records: [], totalCalories: 0 });
  const [targetBurn, setTargetBurn] = useState(null);
  const [waterIntake, setWaterIntake] = useState(0);

  const currentWeight = useMemo(() =>
    Number.isFinite(latestRecord?.weight) ? latestRecord.weight : null,
    [latestRecord]);

  const profileTargetWeight = useMemo(
    () => (Number.isFinite(profile?.targetWeight) ? profile.targetWeight : null),
    [profile],
  );

  useEffect(() => {
    getMealSummary({ date: todayKey })
      .then((summary) => setMealSummary(summary))
      .catch((error) => console.error("Failed to load meal summary", error));
  }, [todayKey]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTargets() {
      if (!profile || !Number.isFinite(currentWeight)) {
        setTargetBurn(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/api/calories/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weightKg: currentWeight,
            heightCm: profile.heightCm,
            age: profile.age,
            sex: profile.sex,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to fetch calorie targets", data);
          return;
        }
        if (!cancelled) {
          setTargetBurn(Number.isFinite(data.tdee) ? data.tdee : null);
        }
      } catch (error) {
        console.error("Error fetching calorie targets", error);
        if (!cancelled) {
          setTargetBurn(null);
        }
      }
    }

    fetchTargets();
    return () => {
      cancelled = true;
    };
  }, [profile, currentWeight]);

  const todayMealEntries = mealSummary.records || [];
  const todayIntakeCalories = mealSummary.totalCalories || 0;

  return (
    <section className="content-grid dashboard-layout">
      <div className="dashboard-top">
        <div className="dashboard-actions"></div>

        <TodaySummaryCard
          todayIntake={todayIntakeCalories}
          todayBurn={todayBurnCalories}
          targetBurn={targetBurn}
          currentWeight={currentWeight}
          yesterdayWeight={currentWeight != null && previousRecord?.weight ? previousRecord.weight : null}
          targetWeight={
            profileTargetWeight ?? (Number.isFinite(targetWeight) ? targetWeight : null)
          }
          waterIntake={waterIntake}
          onEditProfile={onEditProfile}
        />
      </div>

      {/* Gamification Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <StreakCard
          currentStreak={streakData.currentStreak}
          longestStreak={streakData.longestStreak}
          totalDays={streakData.totalDays}
        />
        <WaterTracker onUpdate={setWaterIntake} />
        <QuickStats
          weightRecords={weightRecords}
          targetWeight={profileTargetWeight ?? targetWeight}
        />
      </div>

      <div className="dashboard-middle">
        <TodayMealHighlight meals={todayMealEntries} totalCalories={todayIntakeCalories} />
        <TodayWorkout />
      </div>

      <div className="dashboard-bottom single-column">
        <WeightTrendCard
          records={weightRecords}
          trend={trend}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    </section>
  );
}
