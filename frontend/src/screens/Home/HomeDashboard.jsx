import React, { useMemo } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import SummaryCard from "../../components/ui/SummaryCard.jsx";
import WeightTrackerCard from "../../components/weight/WeightTrackerCard.jsx";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import FitbitTodayCard from "../../components/fitbit/FitbitTodayCard.jsx";
import TodayMealHighlight from "../../components/meals/TodayMealHighlight.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useMealEntries } from "../../hooks/useMealEntries.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { getTodayISO } from "../../utils/date.js";
import { calculateDifference, calculateMonthOverMonth } from "../../utils/weight.js";

const DAILY_TARGET_CALORIES = 2000;

export default function HomeDashboard() {
  const { weightRecords, latestRecord, previousRecord, addWeightRecord, targetWeight } =
    useWeightRecords();
  const { mealEntries } = useMealEntries();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const todayKey = getTodayISO();

  const difference = calculateDifference(weightRecords);
  const { currentAverage, difference: monthDifference } = calculateMonthOverMonth(weightRecords);

  const todayMealEntries = useMemo(
    () => mealEntries.filter((entry) => entry.date === todayKey),
    [mealEntries, todayKey],
  );

  const todayIntakeCalories = useMemo(
    () => todayMealEntries.reduce((total, entry) => total + (Number(entry.totalCalories) || 0), 0),
    [todayMealEntries],
  );

  const remainingCalories = DAILY_TARGET_CALORIES - todayIntakeCalories + todayBurnCalories;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">

        <section className="content-grid dashboard-layout">
          <div className="dashboard-top">
            <section className="card today-summary-card">
              <div className="today-summary-header">
                <div>
                  <h2>今日のサマリー</h2>
                  <p className="muted">目標 {DAILY_TARGET_CALORIES} kcal</p>
                </div>
                <span
                  className={`today-summary-pill ${remainingCalories < 0 ? "negative" : "positive"}`}
                >
                  {remainingCalories < 0 ? "オーバー" : "残り"} {Math.abs(remainingCalories)} kcal
                </span>
              </div>

              <div className="today-summary-grid">
                <div className="today-summary-stat">
                  <span className="stat-label">摂取カロリー</span>
                  <strong className="stat-value">{todayIntakeCalories} kcal</strong>
                  <span className="stat-helper">食事ログから計算</span>
                </div>
                <div className="today-summary-stat">
                  <span className="stat-label">消費カロリー</span>
                  <strong className="stat-value">{todayBurnCalories} kcal</strong>
                  <span className="stat-helper">運動記録の合計</span>
                </div>
                <div className={`today-summary-stat ${remainingCalories < 0 ? "negative" : ""}`}>
                  <span className="stat-label">残り目標</span>
                  <strong className="stat-value">{Math.abs(remainingCalories)} kcal</strong>
                  <span className="stat-helper">
                    {remainingCalories < 0 ? "目標を超えています" : "まだ余裕があります"}
                  </span>
                </div>
              </div>
            </section>

            <div className="top-metrics-grid">
              <div className="summary-cards-row">
                <SummaryCard
                  label="現在の体重"
                  value={latestRecord ? `${latestRecord.weight.toFixed(1)} kg` : "--"}
                  helper={previousRecord ? "前回との差" : "初回の記録を追加しましょう"}
                  trend={previousRecord ? difference : undefined}
                />

                <SummaryCard
                  label="目標体重"
                  value={`${targetWeight.toFixed(1)} kg`}
                  helper="目標との差"
                  trend={latestRecord ? latestRecord.weight - targetWeight : undefined}
                />

                <SummaryCard
                  label="今月の平均"
                  value={
                    currentAverage || currentAverage === 0
                      ? `${currentAverage.toFixed(1)} kg`
                      : "--"
                  }
                  helper="平均体重"
                />

                <SummaryCard
                  label="月次の変化"
                  value={
                    monthDifference || monthDifference === 0
                      ? `${monthDifference > 0 ? "+" : ""}${monthDifference.toFixed(1)} kg`
                      : "--"
                  }
                  helper="先月比"
                  trend={monthDifference ?? undefined}
                />
              </div>

              <FitbitTodayCard />
            </div>
          </div>

          <div className="dashboard-middle">
            <TodayMealHighlight meals={todayMealEntries} totalCalories={todayIntakeCalories} />
            <TodayWorkout />
          </div>

          <div className="dashboard-bottom">
            <WeightTrackerCard
              onSave={addWeightRecord}
              latestRecord={latestRecord}
              previousRecord={previousRecord}
            />
            <WeightTrendCard records={weightRecords} />
          </div>
        </section>
      </main>
    </div>
  );
}
