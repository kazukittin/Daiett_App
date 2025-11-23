import React from "react";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useDailyFixedWorkoutPlan } from "../../hooks/useDailyFixedWorkoutPlan.js";
import { weekdayLabels } from "../../utils/date.js";

export default function TodayWorkout() {
  const { todayExercises, totalCalories } = useTodayExercises();
  const { menus: defaultMenus, weekday } = useDailyFixedWorkoutPlan();
  const hasDefaultPlan = defaultMenus.length > 0;

  return (
    <section className="card today-workout-card">
      <header>
        <h2>今日のワークアウト</h2>
        {todayExercises.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

      {hasDefaultPlan && (
        <div className="fixed-workout-plan">
          <div className="fixed-workout-header">
            <div className="badge">固定メニュー</div>
            <span className="muted">{weekdayLabels[weekday]}に予定しているメニュー</span>
          </div>
          <ul className="fixed-workout-list">
            {defaultMenus.map((menu, index) => (
              <li key={`${menu.name}-${index}`} className="fixed-workout-item">
                <div>
                  <div className="fixed-workout-title">{menu.name || "メニュー名未設定"}</div>
                  <div className="fixed-workout-meta">
                    {menu.type === "seconds" ? `${menu.value} 秒` : `${menu.value} 回`} ／
                    セット数 {menu.sets}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {todayExercises.length === 0 ? (
        <p className="muted">
          今日はまだ運動が登録されてないよ〜{hasDefaultPlan ? " 固定メニューを参考に動いてみよう！" : ""}
        </p>
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
