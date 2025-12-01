import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";
import { getTodayISO } from "../../utils/date.js";
import { addWorkoutRecord, getWorkoutTypes } from "../../api/workouts.js";

export default function AddExercise() {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => getTodayISO());
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");

  useEffect(() => {
    getWorkoutTypes()
      .then((response) => setWorkoutTypes(response?.types || response || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!type.trim() || !duration || !calories) {
      setError("種類・時間・消費カロリーを入力してください");
      return;
    }

    const newRecord = {
      date,
      type: type.trim(),
      duration: Number(duration),
      calories: Number(calories),
      memo: memo.trim() || undefined,
      workoutTypeId: selectedTypeId || undefined,
    };

    await addWorkoutRecord(newRecord);

    setType("");
    setDuration("");
    setCalories("");
    setMemo("");
    setSelectedTypeId("");
    setError("");
  };

  return (
    <section className="page add-exercise-page">
      <header className="page-header add-exercise-header">
        <div>
          <p className="eyebrow">消費カロリー</p>
          <h1 className="page-title">運動記録を追加</h1>
          <p className="muted">今日の運動内容をさっと記録して、消費カロリーを積み上げましょう。</p>
        </div>

        <div className="header-actions">
          <div className="pill-note">時間・カロリーを入力するだけでOK</div>
          <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
            戻る
          </button>
        </div>
      </header>

      <div className="add-exercise-layout">
        <section className="card exercise-form-card">
          <div className="card-header">
            <h2>基本情報</h2>
            <p className="muted small">入力欄は必要なものだけ。まずは必須の項目を埋めましょう。</p>
          </div>

          <form className="exercise-form" onSubmit={handleSubmit}>
            <div className="form-columns">
              <div className="form-field">
                <label htmlFor="exercise-type-select" className="form-label">
                  ワークアウトタイプ（任意）
                </label>
                <select
                  id="exercise-type-select"
                  value={selectedTypeId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setSelectedTypeId(nextId);
                    const selected = workoutTypes.find((item) => item.id === nextId);
                    if (selected && !type) {
                      setType(selected.name);
                    }
                  }}
                >
                  <option value="">選択なし</option>
                  {workoutTypes.map((workoutType) => (
                    <option key={workoutType.id} value={workoutType.id}>
                      {workoutType.name}
                      {Number.isFinite(workoutType.expectedCalories)
                        ? `（目安 ${workoutType.expectedCalories} kcal）`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

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

            <div className="form-actions space-between">
              <div className="helper-note">時間とカロリーがわからない場合は目安でもOK</div>
              <div className="action-buttons">
                <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
                  キャンセル
                </button>
                <button type="submit" className="btn primary">
                  記録する
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className="ds-card compact info-card">
          <div className="ds-card-title">入力のポイント</div>
          <ul className="summary-list">
            <li className="summary-item">
              <span>運動名</span>
              <strong>「ウォーキング」など短く</strong>
            </li>
            <li className="summary-item">
              <span>時間</span>
              <strong>覚えている範囲でOK</strong>
            </li>
            <li className="summary-item">
              <span>メモ</span>
              <strong>体調や強度を残す</strong>
            </li>
          </ul>
        </aside>

        <TodayWorkout />
      </div>
    </section>
  );
}
