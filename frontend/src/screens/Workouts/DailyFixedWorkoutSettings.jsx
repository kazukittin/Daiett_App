import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { useDailyFixedWorkouts } from "../../hooks/useDailyFixedWorkouts.js";
import { WEEKDAY_LABELS } from "../../services/dailyFixedWorkoutsStorage.js";

const emptyMenu = { name: "", type: "reps", value: "", sets: "" };
const defaultDay = { menus: [] };

const toDraftPlan = (plan) => {
  const draft = {};

  WEEKDAY_LABELS.forEach((day) => {
    const menus = plan?.[day.value]?.menus ?? [];
    draft[day.value] = {
      menus: menus.length
        ? menus.map((menu) => ({
            name: menu?.name ?? "",
            type: menu?.type === "seconds" ? "seconds" : "reps",
            value:
              menu?.value === null || menu?.value === undefined
                ? ""
                : String(menu.value),
            sets:
              menu?.sets === null || menu?.sets === undefined
                ? ""
                : String(menu.sets),
          }))
        : [],
    };
  });

  return draft;
};

export default function DailyFixedWorkoutSettings() {
  const { dailyFixedWorkouts, updateDailyFixedWorkouts } = useDailyFixedWorkouts();
  const [draftPlan, setDraftPlan] = useState(toDraftPlan(dailyFixedWorkouts));
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setDraftPlan(toDraftPlan(dailyFixedWorkouts));
  }, [dailyFixedWorkouts]);

  const handleMenuChange = (weekday, index, field, value) => {
    setDraftPlan((prev) => {
      const currentMenus = [...(prev?.[weekday]?.menus ?? [])];
      const targetMenu = { ...(currentMenus[index] ?? emptyMenu), [field]: value };
      currentMenus[index] = targetMenu;

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
        menus: [...(prev?.[weekday]?.menus ?? []), { ...emptyMenu }],
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
    const toNumberOrNull = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const normalizedPlan = WEEKDAY_LABELS.reduce((acc, day) => {
      const menus = draftPlan?.[day.value]?.menus ?? [];
      const cleanedMenus = menus
        .map((menu) => ({
          name: (menu?.name ?? "").trim(),
          type: menu?.type === "seconds" ? "seconds" : "reps",
          value: toNumberOrNull(menu?.value),
          sets: toNumberOrNull(menu?.sets),
        }))
        .filter((menu) => menu.name || menu.value !== null || menu.sets !== null);

      acc[day.value] = { menus: cleanedMenus };
      return acc;
    }, {});

    updateDailyFixedWorkouts(normalizedPlan);
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
                  const menus = current.menus?.length
                    ? current.menus
                    : [{ ...emptyMenu }];

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
                              <div className="fixed-workout-menu-fields">
                                <div className="fixed-workout-input-group">
                                  <label className="fixed-workout-field-label">メニュー名</label>
                                  <input
                                    type="text"
                                    className="fixed-workout-input"
                                    placeholder="例: ベンチプレス"
                                    value={menu.name}
                                    onChange={(event) =>
                                      handleMenuChange(
                                        day.value,
                                        index,
                                        "name",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="fixed-workout-menu-numbers">
                                  <div className="fixed-workout-input-group">
                                    <label className="fixed-workout-field-label">タイプ</label>
                                    <div className="fixed-workout-type-options">
                                      <label className="type-option">
                                        <input
                                          type="radio"
                                          name={`type-${day.value}-${index}`}
                                          value="reps"
                                          checked={menu.type === "reps"}
                                          onChange={(event) =>
                                            handleMenuChange(
                                              day.value,
                                              index,
                                              "type",
                                              event.target.value,
                                            )
                                          }
                                        />
                                        <span>回数</span>
                                      </label>
                                      <label className="type-option">
                                        <input
                                          type="radio"
                                          name={`type-${day.value}-${index}`}
                                          value="seconds"
                                          checked={menu.type === "seconds"}
                                          onChange={(event) =>
                                            handleMenuChange(
                                              day.value,
                                              index,
                                              "type",
                                              event.target.value,
                                            )
                                          }
                                        />
                                        <span>秒</span>
                                      </label>
                                    </div>
                                  </div>

                                  <div className="fixed-workout-input-group">
                                    <label className="fixed-workout-field-label">
                                      {menu.type === "seconds" ? "秒" : "回数"}
                                    </label>
                                    <input
                                      type="number"
                                      className="fixed-workout-input"
                                      value={menu.value}
                                      min="0"
                                      onChange={(event) =>
                                        handleMenuChange(
                                          day.value,
                                          index,
                                          "value",
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="fixed-workout-input-group">
                                    <label className="fixed-workout-field-label">セット数</label>
                                    <input
                                      type="number"
                                      className="fixed-workout-input"
                                      value={menu.sets}
                                      min="0"
                                      onChange={(event) =>
                                        handleMenuChange(
                                          day.value,
                                          index,
                                          "sets",
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

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
