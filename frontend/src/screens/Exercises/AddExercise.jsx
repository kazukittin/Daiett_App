import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import { appendExercise } from "../../services/exerciseStorage.js";
import { getTodayISO } from "../../utils/date.js";
import { getFixedWorkoutForDate } from "../../services/dailyFixedWorkoutsStorage.js";
import { useDailyFixedWorkouts } from "../../hooks/useDailyFixedWorkouts.js";

export default function AddExercise() {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => getTodayISO());
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const { dailyFixedWorkouts } = useDailyFixedWorkouts();
  const lastAppliedPresetRef = useRef("");
  const selectedFixedWorkout = useMemo(
    () => getFixedWorkoutForDate(dailyFixedWorkouts, date),
    [dailyFixedWorkouts, date],
  );

  useEffect(() => {
    const presetName = selectedFixedWorkout?.menus?.[0]?.name ?? "";
    const shouldUpdate = !type || type === lastAppliedPresetRef.current;

    lastAppliedPresetRef.current = presetName;

    if (shouldUpdate) {
      setType(presetName);
    }
  }, [selectedFixedWorkout, type]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!type.trim() || !duration || !calories) {
      setError("種類・時間・消費カロリーを入力してください");
      return;
    }

    const newRecord = {
      id: Date.now(),
      date,
      type: type.trim(),
      duration: Number(duration),
      calories: Number(calories),
      memo: memo.trim() || undefined,
    };

    appendExercise(newRecord);

    setType("");
    setDuration("");
    setCalories("");
    setMemo("");
    setError("");
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">ホーム / 運動 / <span>記録を追加</span></div>
        </header>

        <section className="page add-exercise-page">
          <header className="page-header">
            <h1 className="page-title">運動記録を追加</h1>
            <p className="muted">今日の運動内容を記録して、目標に近づこう</p>
          </header>

          <div className="add-exercise-layout">
            <section className="card exercise-form-card">
              <form className="exercise-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="exercise-date" className="form-label">
                    日付
                  </label>
                  <input
                    id="exercise-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                  <div className="fixed-workout-hint">
                    {selectedFixedWorkout?.menus?.length
                      ? `この日の固定メニュー: ${selectedFixedWorkout.menus
                          .map((menu) => {
                            const name = menu?.name || "メニュー";
                            const details = [
                              menu?.reps !== null && menu?.reps !== undefined && menu?.reps !== ""
                                ? `${menu.reps}回`
                                : "",
                              menu?.seconds !== null &&
                              menu?.seconds !== undefined &&
                              menu?.seconds !== ""
                                ? `${menu.seconds}秒`
                                : "",
                              menu?.sets !== null && menu?.sets !== undefined && menu?.sets !== ""
                                ? `${menu.sets}セット`
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" / ");

                            return details ? `${name} (${details})` : name;
                          })
                          .join("、 ")}`
                      : "固定ワークアウトは設定されていません。"}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="exercise-type" className="form-label">
                    種類
                  </label>
                  <input
                    id="exercise-type"
                    type="text"
                    placeholder="例: ランニング"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                  />
                </div>

                <div className="form-columns">
                  <div className="form-field">
                    <label htmlFor="exercise-duration" className="form-label">
                      時間（分）
                    </label>
                    <input
                      id="exercise-duration"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="exercise-calories" className="form-label">
                      消費カロリー（kcal）
                    </label>
                    <input
                      id="exercise-calories"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={calories}
                      onChange={(event) => setCalories(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="exercise-memo" className="form-label">
                    メモ（任意）
                  </label>
                  <textarea
                    id="exercise-memo"
                    rows="4"
                    placeholder="体調や気づきをメモ"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                  />
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
                    キャンセル
                  </button>
                  <button type="submit" className="btn primary">
                    記録する
                  </button>
                </div>
              </form>
            </section>

            <TodayWorkout />
          </div>
        </section>
      </main>
    </div>
  );
}
