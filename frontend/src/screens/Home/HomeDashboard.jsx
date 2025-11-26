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

  const handleAddMealClick = () => {
    navigate("/meals/new");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <div className="page home-dashboard">
          <header className="dashboard-hero">
            <div className="dashboard-hero-text">
              <p className="section-label">ホーム</p>
              <h1 className="page-title">今日のダッシュボード</h1>
              <p className="muted">きょうのカロリーバランスと記録をひと目でチェックしましょう。</p>
            </div>
            <div className="dashboard-hero-actions">
              <button className="btn secondary" type="button" onClick={handleAddMealClick}>
                🍙 食事を追加
              </button>
              <button className="btn primary" type="button" onClick={handleAddWeightClick}>
                体重を追加
              </button>
            </div>
          </header>

          <section className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-label">サマリー</p>
                <h2 className="section-title">今日のカロリーバランス</h2>
              </div>
              <p className="muted">摂取・消費・残りのカロリーと現在の体重を確認</p>
            </div>

            <TodaySummaryCard
              dailyTargetCalories={DAILY_TARGET_CALORIES}
              intakeCalories={todayIntakeCalories}
              burnCalories={todayBurnCalories}
              remainingCalories={remainingCalories}
              currentWeight={latestRecord?.weight ?? null}
              targetWeight={Number.isFinite(targetWeight) ? targetWeight : null}
            />
          </section>

          <section className="today-focus-grid">
            <div className="section-block">
              <div className="section-header">
                <div>
                  <p className="section-label">今日の食事</p>
                  <h3 className="section-title">食事記録と摂取カロリー</h3>
                </div>
                <button className="btn secondary" type="button" onClick={handleAddMealClick}>
                  食事を記録する
                </button>
              </div>

              <TodayMealHighlight meals={todayMealEntries} totalCalories={todayIntakeCalories} />
            </div>

            <div className="section-block">
              <div className="section-header">
                <div>
                  <p className="section-label">今日の運動</p>
                  <h3 className="section-title">運動メニューと消費カロリー</h3>
                </div>
              </div>

              <TodayWorkout />
            </div>
          </section>

          <section className="section-stack">
            <div className="section-header">
              <div>
                <p className="section-label">推移</p>
                <h3 className="section-title">体重・カロリーのトレンド</h3>
              </div>
              <div className="section-actions">
                <button className="btn secondary" type="button" onClick={handleAddWeightClick}>
                  今日の体重を記録
                </button>
              </div>
            </div>

            <WeightTrendCard records={weightRecords} calorieTrends={calorieTrends} />
          </section>
        </div>
      </main>
    </div>
  );
}
