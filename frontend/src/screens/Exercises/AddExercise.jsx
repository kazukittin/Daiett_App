// src/screens/Exercises/AddExercise.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getToday() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function AddExercise() {
  const navigate = useNavigate();

  const [date, setDate] = useState(getToday());
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [memo, setMemo] = useState("");

  const [todayList, setTodayList] = useState([]);

  // データ取得
  const loadData = () => {
    try {
      return JSON.parse(localStorage.getItem("exercises")) || [];
    } catch {
      return [];
    }
  };

  // 保存
  const saveData = (data) => {
    localStorage.setItem("exercises", JSON.stringify(data));
  };

  // 今日のワークアウト読み込み
  useEffect(() => {
    const all = loadData();
    const today = getToday();
    setTodayList(all.filter((e) => e.date === today));
  }, []);

  const submit = (e) => {
    e.preventDefault();

    if (!type || !duration || !calories) {
      alert("入力に抜けがあるよ〜！");
      return;
    }

    const all = loadData();
    const newItem = {
      id: Date.now(),
      date,
      type,
      duration: Number(duration),
      calories: Number(calories),
      memo,
    };

    const updated = [...all, newItem];
    saveData(updated);

    // 今日の一覧更新
    const today = getToday();
    setTodayList(updated.filter((e) => e.date === today));

    // 入力をリセット
    setType("");
    setDuration("");
    setCalories("");
    setMemo("");
  };

  return (
    <div className="page add-exercise-page">
      <h1>運動記録を追加する</h1>

      <form onSubmit={submit} className="exercise-form">
        <label>
          日付
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          種類
          <input
            type="text"
            placeholder="例: ランニング"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </label>

        <label>
          時間（分）
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </label>

        <label>
          消費カロリー
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </label>

        <label>
          メモ（任意）
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
        </label>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)}>
            戻る
          </button>
          <button type="submit">保存する</button>
        </div>
      </form>

      <h2>今日のワークアウト</h2>
      {todayList.length === 0 ? (
        <p>今日はまだ運動を登録してないよ〜！</p>
      ) : (
        <ul className="today-exercise-list">
          {todayList.map((e) => (
            <li key={e.id}>
              <strong>{e.type}</strong> / {e.duration}分 / {e.calories}kcal
              {e.memo && <div className="memo">{e.memo}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
