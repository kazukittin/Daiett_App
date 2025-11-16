import React from "react";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";

export default function TodayWorkout() {
  const { todayExercises, totalCalories } = useTodayExercises();

  return (
    <section className="card today-workout-card">
      <header>
        <h2>今日のワークアウト</h2>
        {todayExercises.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

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
