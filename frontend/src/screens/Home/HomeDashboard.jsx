import React, { useEffect, useState } from "react";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import TodayMealHighlight from "../../components/meals/TodayMealHighlight.jsx";
import TodaySummaryCard from "../../components/summary/TodaySummaryCard.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useWeightTrend } from "../../hooks/useWeightTrend.js";
import { getMealSummary } from "../../api/meals.js";
import { getTodayISO } from "../../utils/date.js";

const DAILY_TARGET_INTAKE = 2000;
const DAILY_TARGET_BURN = 500;

export default function HomeDashboard({ onEditProfile }) {
  // Weight summaries and trend data come from backend APIs via hooks.
  const { weightRecords, latestRecord, previousRecord, targetWeight } = useWeightRecords();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const { trend, period, setPeriod } = useWeightTrend();
  const todayKey = getTodayISO();
  const [mealSummary, setMealSummary] = useState({ records: [], totalCalories: 0 });

  useEffect(() => {
    getMealSummary({ date: todayKey })
      .then((summary) => setMealSummary(summary))
      .catch((error) => console.error("Failed to load meal summary", error));
  }, [todayKey]);

  const todayMealEntries = mealSummary.records || [];
  const todayIntakeCalories = mealSummary.totalCalories || 0;

  return (
    <section className="content-grid dashboard-layout">
      <div className="dashboard-top">
        <div className="dashboard-actions"></div>

        <TodaySummaryCard
          todayIntake={todayIntakeCalories}
          targetIntake={DAILY_TARGET_INTAKE}
          todayBurn={todayBurnCalories}
          targetBurn={DAILY_TARGET_BURN}
          currentWeight={latestRecord?.weight ?? null}
          yesterdayWeight={latestRecord?.weight && previousRecord?.weight ? previousRecord.weight : null}
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
