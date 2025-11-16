import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";

const STORAGE_KEY = "exercises";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function readExercises() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to parse exercises from storage", error);
    return [];
  }
}

function saveExercises(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function AddExercise() {
  const navigate = useNavigate();
  const today = useMemo(() => getToday(), []);
  const [date, setDate] = useState(today);
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

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
      memo: memo.trim(),
    };

    const existing = readExercises();
    const updated = [...existing, newRecord];
    saveExercises(updated);
    window.dispatchEvent(new Event("exercisesUpdated"));

    setType("");
    setDuration("");
    setCalories("");
    setMemo("");
    setError("");
  };

  return (
    <div className="page add-exercise-page">
      <header className="page-header">
        <h1 className="page-title">運動記録を追加する</h1>
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
    </div>
  );
}
