import React from "react";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useDailyFixedWorkouts } from "../../hooks/useDailyFixedWorkouts.js";
import { getFixedWorkoutForDate } from "../../services/dailyFixedWorkoutsStorage.js";
import { getTodayISO } from "../../utils/date.js";

export default function TodayWorkout() {
  const { todayExercises, totalCalories } = useTodayExercises();
  const { dailyFixedWorkouts } = useDailyFixedWorkouts();
  const todayKey = getTodayISO();
  const fixedWorkout = getFixedWorkoutForDate(dailyFixedWorkouts, todayKey);
  const hasFixedWorkout = Boolean(fixedWorkout?.name || fixedWorkout?.rest);

  return (
    <section className="card today-workout-card">
      <header className="today-workout-header">
        <div className="today-workout-title">
          <h2>今日のワークアウト</h2>
          {hasFixedWorkout && (
            <span className="badge">
              {fixedWorkout.rest ? "休養日に設定" : `固定: ${fixedWorkout.name}`}
            </span>
          )}
        </div>
        {todayExercises.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

      {hasFixedWorkout && (
        <div className={`fixed-workout-plan ${fixedWorkout.rest ? "rest" : ""}`}>
          {fixedWorkout.rest
            ? "今日は固定の休養日に設定されています。ゆっくり休みましょう。"
            : `今日は「${fixedWorkout.name}」の日として保存されています。`}
        </div>
      )}

      {todayExercises.length === 0 ? (
        <p className="muted">今日はまだ運動が登録されてないよ〜</p>
      ) : (
        <ul className="today-workout-list">
          {todayExercises.map((record) => (
            <li key={record.id} className="today-workout-item">
              <div className="today-workout-main">
                <strong>{record.type}</strong>
                <span className="today-workout-sub">
                  {record.duration}分 ・ {record.calories} kcal
                </span>
              </div>
              {record.memo && <div className="memo">{record.memo}</div>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
