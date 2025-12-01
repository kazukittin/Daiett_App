import React, { useEffect, useMemo, useState } from "react";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import TodayMealHighlight from "../../components/meals/TodayMealHighlight.jsx";
import TodaySummaryCard from "../../components/summary/TodaySummaryCard.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";
import { getMealSummary } from "../../api/meals.js";
import { getTodayISO } from "../../utils/date.js";

export default function HomeDashboard({ onEditProfile, profile }) {
  // Weight summaries and trend data come from backend APIs via hooks.
  const { weightRecords, latestRecord, previousRecord, targetWeight } = useWeightRecords();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const { trend, period, setPeriod } = useWeightTrend();
  const todayKey = getTodayISO();
  const [mealSummary, setMealSummary] = useState({ records: [], totalCalories: 0 });
  const [targetIntake, setTargetIntake] = useState(null);
  const [targetBurn, setTargetBurn] = useState(null);

  const currentWeight = useMemo(() =>
    Number.isFinite(latestRecord?.weight) ? latestRecord.weight : null,
  [latestRecord]);

  useEffect(() => {
    getMealSummary({ date: todayKey })
      .then((summary) => setMealSummary(summary))
      .catch((error) => console.error("Failed to load meal summary", error));
  }, [todayKey]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTargets() {
      if (!profile || !Number.isFinite(currentWeight)) {
        setTargetIntake(null);
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
          setTargetIntake(Number.isFinite(data.targetCalories) ? data.targetCalories : null);
          setTargetBurn(Number.isFinite(data.tdee) ? data.tdee : null);
        }
      } catch (error) {
        console.error("Error fetching calorie targets", error);
        if (!cancelled) {
          setTargetIntake(null);
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
          targetIntake={targetIntake}
          todayBurn={todayBurnCalories}
          targetBurn={targetBurn}
          currentWeight={currentWeight}
          yesterdayWeight={currentWeight != null && previousRecord?.weight ? previousRecord.weight : null}
          targetWeight={Number.isFinite(targetWeight) ? targetWeight : null}
          onEditProfile={onEditProfile}
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
