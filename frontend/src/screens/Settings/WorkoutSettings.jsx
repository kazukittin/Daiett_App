import React, { useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { weekdayLabels } from "../../utils/date.js";
import { loadDailyFixedWorkouts, saveDailyFixedWorkouts } from "../../services/dailyFixedWorkouts.js";
import { startFitbitAuth } from "../../services/fitbitApi.js";
import { useFitbitToday } from "../../hooks/useFitbitToday.js";

const createEmptyMenu = () => ({ name: "", type: "reps", value: "", sets: "" });

export default function WorkoutSettings() {
  const [plans, setPlans] = useState(() => loadDailyFixedWorkouts());
  const [saveStatus, setSaveStatus] = useState("");

  const { data: fitbitData, loading: fitbitLoading, error: fitbitError, refresh } = useFitbitToday();

  const handleAddMenu = (weekday) => {
    setPlans((prev) => {
      const prevMenus = prev?.[weekday]?.menus ?? [];
      return { ...prev, [weekday]: { menus: [...prevMenus, createEmptyMenu()] } };
    });
  };

  const handleMenuChange = (weekday, menuIndex, field, value) => {
    setPlans((prev) => {
      const prevMenus = prev?.[weekday]?.menus ?? [];
      const updatedMenus = prevMenus.map((menu, index) =>
        index === menuIndex ? { ...menu, [field]: value } : menu,
      );
      return { ...prev, [weekday]: { menus: updatedMenus } };
    });
  };

  const handleRemoveMenu = (weekday, menuIndex) => {
    setPlans((prev) => {
      const prevMenus = prev?.[weekday]?.menus ?? [];
      const nextMenus = prevMenus.filter((_, index) => index !== menuIndex);
      return { ...prev, [weekday]: { menus: nextMenus } };
    });
  };

  const handleSave = () => {
    const normalized = saveDailyFixedWorkouts(plans);
    if (normalized) {
      setPlans(normalized);
      setSaveStatus("保存しました");
      setTimeout(() => setSaveStatus(""), 2500);
    } else {
      setSaveStatus("保存に失敗しました");
    }
  };

  const fitbitSummary = useMemo(() => fitbitData?.summary, [fitbitData]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">

        <section className="page settings-page">
          <div className="settings-grid">
            <Card title="デイリー固定ワークアウト設定" className="daily-plan-card">
              <p className="muted">
                曜日ごとに固定のワークアウトメニューを登録しておくと、毎日のプランをすぐに確認できます。
              </p>

              <div className="weekday-settings-grid">
                {weekdayLabels.map((label, weekday) => {
                  const menus = plans?.[weekday]?.menus ?? [];
                  return (
                    <div key={label} className="weekday-settings-block">
                      <div className="weekday-settings-header">
                        <div>
                          <div className="weekday-label">{label}</div>
                          <p className="muted small">必要なメニューを追加して保存してください。</p>
                        </div>
                        <button
                          type="button"
                          className="ds-button secondary"
                          onClick={() => handleAddMenu(weekday)}
                        >
                          メニューを追加
                        </button>
                      </div>

                      {menus.length === 0 && (
                        <div className="empty-menu-state">まだメニューがありません</div>
                      )}

                      {menus.map((menu, index) => (
                        <div key={`${label}-${index}`} className="menu-entry">
                          <div className="menu-row">
                            <label className="menu-label">メニュー名</label>
                            <input
                              type="text"
                              value={menu.name}
                              onChange={(event) =>
                                handleMenuChange(weekday, index, "name", event.target.value)
                              }
                              placeholder="例: プッシュアップ"
                            />
                          </div>

                          <div className="menu-row menu-row-grid">
                            <div className="menu-field">
                              <label className="menu-label">タイプ</label>
                              <select
                                value={menu.type}
                                onChange={(event) =>
                                  handleMenuChange(weekday, index, "type", event.target.value)
                                }
                              >
                                <option value="reps">回数</option>
                                <option value="seconds">秒</option>
                              </select>
                            </div>

                            <div className="menu-field">
                              <label className="menu-label">{menu.type === "seconds" ? "秒" : "回数"}</label>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={menu.value}
                                onChange={(event) =>
                                  handleMenuChange(weekday, index, "value", event.target.value)
                                }
                              />
                            </div>

                            <div className="menu-field">
                              <label className="menu-label">セット数</label>
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={menu.sets}
                                onChange={(event) =>
                                  handleMenuChange(weekday, index, "sets", event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="menu-actions">
                            <button
                              type="button"
                              className="ds-button ghost danger-text"
                              onClick={() => handleRemoveMenu(weekday, index)}
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="form-actions end">
                {saveStatus && <span className="save-status">{saveStatus}</span>}
                <button type="button" className="ds-button primary" onClick={handleSave}>
                  設定を保存
                </button>
              </div>
            </Card>

            <Card title="Fitbit連携" className="fitbit-card">
              <p className="muted">
                Fitbitアカウントを連携すると、今日のアクティビティデータを自動で取得できます。
              </p>

              {fitbitError && <div className="form-error">{fitbitError}</div>}

              <div className="fitbit-status-row">
                <div className={`status-dot ${fitbitData?.connected ? "on" : "off"}`} />
                <div>
                  <div className="status-label">
                    {fitbitData?.connected ? "Fitbitと連携済み" : "未連携"}
                  </div>
                  <div className="muted small">
                    {fitbitData?.lastSync
                      ? `最終同期: ${new Date(fitbitData.lastSync).toLocaleString("ja-JP")}`
                      : "まだ同期はありません"}
                  </div>
                </div>
              </div>

              {fitbitLoading ? (
                <div className="muted">Fitbitデータを読み込み中...</div>
              ) : fitbitData?.connected && fitbitSummary ? (
                <ul className="fitbit-summary-list">
                  <li>
                    <span>歩数</span>
                    <strong>{fitbitSummary.steps?.toLocaleString?.() ?? "-"}</strong>
                  </li>
                  <li>
                    <span>消費カロリー</span>
                    <strong>{fitbitSummary.caloriesOut ? `${fitbitSummary.caloriesOut} kcal` : "-"}</strong>
                  </li>
                  <li>
                    <span>アクティブ分数</span>
                    <strong>{fitbitSummary.activeMinutes ?? "-"} 分</strong>
                  </li>
                  {fitbitSummary.restingHeartRate !== undefined && (
                    <li>
                      <span>安静時心拍数</span>
                      <strong>{fitbitSummary.restingHeartRate} bpm</strong>
                    </li>
                  )}
                </ul>
              ) : (
                <div className="muted">連携するとデータがここに表示されます。</div>
              )}

              <div className="form-actions space-between">
                <button type="button" className="ds-button secondary" onClick={refresh}>
                  再読み込み
                </button>
                <button type="button" className="ds-button primary" onClick={startFitbitAuth}>
                  Fitbitと連携する
                </button>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
