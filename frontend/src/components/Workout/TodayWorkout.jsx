import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "exercises";

function getTodayKey() {
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

export default function TodayWorkout() {
  const [records, setRecords] = useState(() => readExercises());

  useEffect(() => {
    const handleUpdate = () => {
      setRecords(readExercises());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("exercisesUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("exercisesUpdated", handleUpdate);
    };
  }, []);

  const today = getTodayKey();

  const { todayRecords, totalCalories } = useMemo(() => {
    const todayRecords = records.filter((record) => record.date === today);
    const totalCalories = todayRecords.reduce(
      (total, record) => total + (Number(record.calories) || 0),
      0,
    );

    return { todayRecords, totalCalories };
  }, [records, today]);

  return (
    <section className="card today-workout-card">
      <header>
        <h2>今日のワークアウト</h2>
        {todayRecords.length > 0 && (
          <div className="today-workout-summary">合計 {totalCalories} kcal</div>
        )}
      </header>

      {todayRecords.length === 0 ? (
        <p className="muted">今日はまだ運動が登録されてないよ〜</p>
      ) : (
        <ul className="today-workout-list">
          {todayRecords.map((record) => (
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
