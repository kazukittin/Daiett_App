import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { useDailyFixedWorkouts } from "../../hooks/useDailyFixedWorkouts.js";
import { WEEKDAY_LABELS } from "../../services/dailyFixedWorkoutsStorage.js";

const defaultDay = { menus: [] };

export default function DailyFixedWorkoutSettings() {
  const { dailyFixedWorkouts, updateDailyFixedWorkouts } = useDailyFixedWorkouts();
  const [draftPlan, setDraftPlan] = useState(dailyFixedWorkouts);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setDraftPlan(dailyFixedWorkouts);
  }, [dailyFixedWorkouts]);

  const handleMenuChange = (weekday, index, value) => {
    setDraftPlan((prev) => {
      const currentMenus = [...(prev?.[weekday]?.menus ?? [])];
      currentMenus[index] = value;

      return {
        ...prev,
        [weekday]: {
          ...(prev?.[weekday] ?? defaultDay),
          menus: currentMenus,
        },
      };
    });
  };

  const handleAddMenu = (weekday) => {
    setDraftPlan((prev) => ({
      ...prev,
      [weekday]: {
        ...(prev?.[weekday] ?? defaultDay),
        menus: [...(prev?.[weekday]?.menus ?? []), ""],
      },
    }));
  };

  const handleRemoveMenu = (weekday, index) => {
    setDraftPlan((prev) => ({
      ...prev,
      [weekday]: {
        ...(prev?.[weekday] ?? defaultDay),
        menus: (prev?.[weekday]?.menus ?? []).filter(
          (_, menuIndex) => menuIndex !== index,
        ),
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
            <h1 className="page-title">固定ワークアウト設定</h1>
            <p className="muted">
              曜日ごとに固定のワークアウトメニューを登録しておくと、「今日のワークアウト」や記録画面に自動で反映されます。
            </p>
          </header>

          <Card title="週間の固定ワークアウト">
            <form className="fixed-workout-form" onSubmit={handleSubmit}>
              <div className="fixed-workout-grid">
                {WEEKDAY_LABELS.map((day) => {
                  const current = draftPlan?.[day.value] ?? defaultDay;
                  const menus = current.menus?.length ? current.menus : [""];

                  return (
                    <div key={day.value} className="fixed-workout-row">
                      <div className="day-label">
                        <span className="day-label-main">{day.label}</span>
                        <span className="day-label-sub">({day.short})</span>
                      </div>

                      <div className="fixed-workout-row-controls">
                        <div className="fixed-workout-menu-list">
                          {menus.map((menu, index) => (
                            <div className="fixed-workout-menu-item" key={`${day.value}-${index}`}>
                              <input
                                type="text"
                                className="fixed-workout-input"
                                placeholder="例: ベンチプレス"
                                value={menu}
                                onChange={(event) =>
                                  handleMenuChange(day.value, index, event.target.value)
                                }
                              />
                              {menus.length > 1 && (
                                <button
                                  type="button"
                                  className="btn ghost fixed-workout-remove"
                                  onClick={() => handleRemoveMenu(day.value, index)}
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="fixed-workout-row-actions">
                          <button
                            type="button"
                            className="btn secondary"
                            onClick={() => handleAddMenu(day.value)}
                          >
                            メニューを追加
                          </button>
                        </div>
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
