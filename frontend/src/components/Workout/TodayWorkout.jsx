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
  const hasFixedWorkout = Boolean(fixedWorkout?.menus?.length);

  const renderMenuMeta = (menu) => {
    const details = [
      menu.reps !== null && menu.reps !== undefined ? `${menu.reps}回` : "",
      menu.seconds !== null && menu.seconds !== undefined ? `${menu.seconds}秒` : "",
      menu.sets !== null && menu.sets !== undefined ? `${menu.sets}セット` : "",
    ]
      .filter(Boolean)
      .join(" / ");

    return details;
  };

  return (
    <section className="card today-workout-card">
      <header className="today-workout-header">
        <div className="today-workout-title">
          <h2>今日のワークアウト</h2>
          {hasFixedWorkout && <span className="badge">固定メニュー</span>}
        </div>
        {todayExercises.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

      {hasFixedWorkout && (
        <div className="fixed-workout-plan">
          <div className="fixed-workout-plan-title">今日の固定メニュー</div>
          <ul className="fixed-workout-menu-list">
            {fixedWorkout.menus.map((menu, index) => {
              const label = menu?.name || "メニュー";
              const meta = renderMenuMeta(menu ?? {});
              return (
                <li key={`${label}-${index}`} className="fixed-workout-menu-item">
                  <div className="fixed-workout-menu-name">{label}</div>
                  {meta && <div className="fixed-workout-menu-meta">{meta}</div>}
                </li>
              );
            })}
          </ul>
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
