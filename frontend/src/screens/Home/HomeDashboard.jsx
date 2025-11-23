import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import SummaryCard from "../../components/ui/SummaryCard.jsx";
import Card from "../../components/ui/Card.jsx";
import WeightTrackerCard from "../../components/weight/WeightTrackerCard.jsx";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { useMealEntries } from "../../hooks/useMealEntries.js";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { getTodayISO } from "../../utils/date.js";
import { calculateDifference, calculateMonthOverMonth } from "../../utils/weight.js";
import { fetchFitbitToday } from "../../services/fitbitApi.js";

const DAILY_TARGET_CALORIES = 2000;

export default function HomeDashboard() {
  const { weightRecords, latestRecord, previousRecord, addWeightRecord, targetWeight } =
    useWeightRecords();
  const { mealEntries } = useMealEntries();
  const { totalCalories: todayBurnCalories } = useTodayExercises();
  const todayKey = getTodayISO();
  const [fitbitData, setFitbitData] = useState(null);
  const [fitbitError, setFitbitError] = useState("");

  useEffect(() => {
    const loadFitbit = async () => {
      try {
        const data = await fetchFitbitToday();
        setFitbitData(data);
      } catch (error) {
        setFitbitError("Fitbitデータを取得できませんでした。");
      }
    };

    loadFitbit();
  }, []);

  const difference = calculateDifference(weightRecords);
  const { currentAverage, difference: monthDifference } = calculateMonthOverMonth(weightRecords);

  const todayIntakeCalories = useMemo(
    () =>
      mealEntries
        .filter((entry) => entry.date === todayKey)
        .reduce((total, entry) => total + (Number(entry.totalCalories) || 0), 0),
    [mealEntries, todayKey],
  );

  const remainingCalories = DAILY_TARGET_CALORIES - todayIntakeCalories + todayBurnCalories;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">ホーム / <span>概要</span></div>
          <span className="badge">今日の記録を確認</span>
        </header>

        <section className="content-grid">
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

          <TodayWorkout />

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

          <div className="grid-2">
            <WeightTrackerCard
              onSave={addWeightRecord}
              latestRecord={latestRecord}
              previousRecord={previousRecord}
            />
            <WeightTrendCard records={weightRecords} />
          </div>

          <div className="grid-3">
            <Card title="Fitbitアクティビティ">
              {fitbitData ? (
                <div className="metric-highlight">
                  <h2>{fitbitData.steps ?? "--"} 歩</h2>
                  <small>消費 {fitbitData.caloriesOut ?? "--"} kcal / アクティブ {fitbitData.activeMinutes ?? "--"} 分</small>
                </div>
              ) : fitbitError ? (
                <p className="muted">{fitbitError}</p>
              ) : (
                <p className="muted">Fitbitを連携してデータを取得しましょう。</p>
              )}
            </Card>
            <Card title="現在の気分">
              <div className="metric-highlight">
                <h2>エネルギッシュ</h2>
                <small>睡眠時間: 7h 30m</small>
              </div>
            </Card>
            <Card title="消費カロリー">
              <div className="metric-highlight">
                <h2>649 kcal</h2>
                <small>前日比 +42 kcal</small>
              </div>
            </Card>
          </div>

          <div className="grid-2">
            <Card title="食事ログ">
              <div className="chip-row">
                {["追加", "ビュー", "編集", "削除", "履歴"].map((action) => (
                  <span key={action} className="chip">
                    {action}
                  </span>
                ))}
              </div>
            </Card>
            <Card title="睡眠分析">
              <div className="sleep-grid">
                <div className="sleep-item">
                  <div className="sleep-label">REM の期間</div>
                  <div className="sleep-value">22%</div>
                </div>
                <div className="sleep-item">
                  <div className="sleep-label">ディープスリープ</div>
                  <div className="sleep-value">52%</div>
                </div>
                <div className="sleep-item">
                  <div className="sleep-label">ライトスリープ</div>
                  <div className="sleep-value">16%</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid-2">
            <Card title="カロリック概要">
              <ul className="summary-list">
                <li className="summary-item">
                  <span>総摂取量</span>
                  <strong>2,700 kcal</strong>
                </li>
                <li className="summary-item">
                  <span>炭水化物</span>
                  <strong>163 g</strong>
                </li>
                <li className="summary-item">
                  <span>脂肪摂取</span>
                  <strong>53 g</strong>
                </li>
              </ul>
            </Card>

            <Card title="今後のお食事">
              <ul className="upcoming-list">
                <li>イブニングジョグ</li>
                <li>サラダでランチ</li>
                <li>マインドフルイーティング</li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
