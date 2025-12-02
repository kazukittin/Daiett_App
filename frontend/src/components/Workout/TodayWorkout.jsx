import React, { useState } from "react";
import { useTodayExercises } from "../../hooks/useTodayExercises.js";
import { useDailyFixedWorkoutPlan } from "../../hooks/useDailyFixedWorkoutPlan.js";
import { getTodayISO, weekdayLabels } from "../../utils/date.js";
import {
  completeTodayWorkout,
  getTodayWorkoutStatus,
  uncompleteTodayWorkout,
} from "../../api/workouts.js";

const buildMenuKey = (menu, index) => `${menu?.name || "menu"}-${index}`;

const estimateCalories = (menu) => {
  const explicitInput = menu.expectedCalories;
  if (explicitInput !== undefined && explicitInput !== null && explicitInput !== "") {
    const explicit = Number(explicitInput);
    if (Number.isFinite(explicit)) {
      return Math.max(1, Math.round(explicit));
    }
  }

  const sets = Number(menu.sets) || 1;
  if (menu.type === "seconds") {
    const minutes = ((Number(menu.value) || 0) * sets) / 60;
    return Math.max(1, Math.round(minutes * 8));
  }
  const reps = Number(menu.value) || 0;
  return Math.max(1, Math.round(reps * sets * 0.5));
};

const estimateDuration = (menu) => {
  const sets = Number(menu.sets) || 1;
  if (menu.type === "seconds") {
    return Math.max(1, Math.round(((Number(menu.value) || 0) * sets) / 60));
  }
  const reps = Number(menu.value) || 0;
  return Math.max(5, Math.round((reps * sets) / 10));
};

export default function TodayWorkout() {
  const { todayExercises, totalCalories, addExercise, removeExercise } = useTodayExercises();
  const { menus: defaultMenus, weekday } = useDailyFixedWorkoutPlan();
  const hasDefaultPlan = defaultMenus.length > 0;
  const [completedToday, setCompletedToday] = useState(false);
  const [completedMenuKeys, setCompletedMenuKeys] = useState(() => new Set());

  React.useEffect(() => {
    let isMounted = true;
    const loadStatus = async () => {
      try {
        const status = await getTodayWorkoutStatus();
        if (!isMounted) return;
        setCompletedToday(Boolean(status.completed));
      } catch (error) {
        console.error("Failed to load workout status", error);
      }
    };
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const completed = new Set();
    defaultMenus.forEach((menu, index) => {
      const key = buildMenuKey(menu, index);
      const matched = todayExercises.some(
        (record) => record.meta === "fixed" && record.type === (menu.name || "固定メニュー")
      );
      if (matched) {
        completed.add(key);
      }
    });

    if (completedToday) {
      defaultMenus.forEach((menu, index) => {
        completed.add(buildMenuKey(menu, index));
      });
    }

    setCompletedMenuKeys(completed);
  }, [defaultMenus, todayExercises, completedToday]);

  const handleToggleMenu = async (menu, index, isCompleted) => {
    const key = buildMenuKey(menu, index);

    if (isCompleted) {
      const record = todayExercises.find(
        (item) => item.meta === "fixed" && item.type === (menu.name || "固定メニュー")
      );
      if (record) {
        await removeExercise(record.id);
      }

      const nextKeys = new Set(completedMenuKeys);
      nextKeys.delete(key);
      setCompletedMenuKeys(nextKeys);

      if (completedToday) {
        await uncompleteTodayWorkout();
        setCompletedToday(false);
      }
      return;
    }

    const payload = {
      date: getTodayISO(),
      type: menu.name || "固定メニュー",
      duration: estimateDuration(menu),
      calories: estimateCalories(menu),
      memo: "固定ワークアウトを実施",
      meta: "fixed",
    };

    await addExercise(payload);

    const nextKeys = new Set(completedMenuKeys);
    nextKeys.add(key);
    setCompletedMenuKeys(nextKeys);

    if (nextKeys.size >= defaultMenus.length && defaultMenus.length > 0) {
      await completeTodayWorkout();
      setCompletedToday(true);
    }
  };

  return (
    <section className="card today-workout-card">
      <header>
        <h2>今日のワークアウト</h2>
        {todayExercises.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

      {!hasDefaultPlan && (
        <div className="muted">本日の固定ワークアウトは設定されていません。</div>
      )}

      {hasDefaultPlan && (
        <div className="fixed-workout-plan">
          <div className="fixed-workout-header">
            <div className="badge">固定メニュー</div>
            <span className="muted">{weekdayLabels[weekday]}に予定しているメニュー</span>
          </div>
          <ul className="fixed-workout-list">
            {defaultMenus.map((menu, index) => {
              const key = buildMenuKey(menu, index);
              const isCompleted = completedMenuKeys.has(key) || completedToday;
              return (
                <li key={key} className="fixed-workout-item">
                  <label className="fixed-workout-check">
                    <input
                      type="checkbox"
                      onChange={() => handleToggleMenu(menu, index, isCompleted)}
                      checked={isCompleted}
                    />
                    <div>
                      <div className="fixed-workout-title">{menu.name || "メニュー名未設定"}</div>
                      <div className="fixed-workout-meta">
                        {menu.type === "seconds" ? `${menu.value} 秒` : `${menu.value} 回`} ／
                        セット数 {menu.sets}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {todayExercises.length === 0 ? (
        <p className="muted">
          今日はまだ運動が登録されてないよ〜{hasDefaultPlan ? " 固定メニューを参考に動いてみよう！" : ""}
        </p>
      ) : (
        <ul className="today-workout-list">
          {todayExercises.map((record) => {
            const expected = Number.isFinite(record.expectedCalories)
              ? record.expectedCalories
              : null;
            const diff =
              expected != null && Number.isFinite(record.calories)
                ? record.calories - expected
                : null;
            const diffText = diff == null ? "" : `（${diff > 0 ? "+" : ""}${diff}）`;
            return (
              <li key={record.id} className="today-workout-item">
                <div className="today-workout-main">
                  <strong>{record.type}</strong>
                  <span className="today-workout-sub">
                    実績：{record.calories} kcal
                    {expected != null ? ` / 目安：${expected} kcal ${diffText}` : ""}
                  </span>
                </div>
                {record.memo && <div className="memo">{record.memo}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
