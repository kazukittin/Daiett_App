import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { useDailyFixedWorkouts } from "../../hooks/useDailyFixedWorkouts.js";
import { WEEKDAY_LABELS } from "../../services/dailyFixedWorkoutsStorage.js";

const defaultDay = { name: "", rest: false };

export default function DailyFixedWorkoutSettings() {
  const { dailyFixedWorkouts, updateDailyFixedWorkouts } = useDailyFixedWorkouts();
  const [draftPlan, setDraftPlan] = useState(dailyFixedWorkouts);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setDraftPlan(dailyFixedWorkouts);
  }, [dailyFixedWorkouts]);

  const handleNameChange = (weekday, value) => {
    setDraftPlan((prev) => ({
      ...prev,
      [weekday]: {
        ...(prev?.[weekday] ?? defaultDay),
        name: value,
        rest: false,
      },
    }));
  };

  const handleRestToggle = (weekday, rest) => {
    setDraftPlan((prev) => ({
      ...prev,
      [weekday]: {
        ...(prev?.[weekday] ?? defaultDay),
        rest,
        name: rest ? "" : prev?.[weekday]?.name ?? "",
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateDailyFixedWorkouts(draftPlan);
    setStatusMessage("保存しました。毎日の画面で自動的に反映されます。");
    if (typeof window !== "undefined") {
      window.setTimeout(() => setStatusMessage(""), 3500);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">ホーム / 運動 / <span>固定ワークアウト設定</span></div>
        </header>

        <section className="page fixed-workout-settings-page">
          <header className="page-header">
            <h1 className="page-title">Daily Fixed Workout Settings</h1>
            <p className="muted">
              曜日ごとに固定のワークアウトを登録しておくと、「今日のワークアウト」や記録画面に自動で反映されます。
            </p>
          </header>

          <Card title="週間の固定ワークアウト">
            <form className="fixed-workout-form" onSubmit={handleSubmit}>
              <div className="fixed-workout-grid">
                {WEEKDAY_LABELS.map((day) => {
                  const current = draftPlan?.[day.value] ?? defaultDay;
                  return (
                    <div key={day.value} className="fixed-workout-row">
                      <div className="day-label">
                        <span className="day-label-main">{day.label}</span>
                        <span className="day-label-sub">({day.short})</span>
                      </div>

                      <div className="fixed-workout-row-controls">
                        <input
                          type="text"
                          className="fixed-workout-input"
                          placeholder="例: Push / Pull / Legs"
                          value={current.name}
                          onChange={(event) => handleNameChange(day.value, event.target.value)}
                          disabled={current.rest}
                        />

                        <label className="rest-toggle">
                          <input
                            type="checkbox"
                            checked={current.rest}
                            onChange={(event) => handleRestToggle(day.value, event.target.checked)}
                          />
                          休養日にする
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="form-actions">
                {statusMessage && <span className="save-status">{statusMessage}</span>}
                <button type="submit" className="btn primary">
                  保存する
                </button>
              </div>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
}
