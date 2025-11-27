import React, { useMemo, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { weekdayLabels } from "../../utils/date.js";
import { loadDailyFixedWorkouts, saveDailyFixedWorkouts } from "../../services/dailyFixedWorkouts.js";
import { startFitbitAuth } from "../../services/fitbitApi.js";
import { useFitbitToday } from "../../hooks/useFitbitToday.js";

const createEmptyMenu = () => ({ name: "", type: "reps", value: "", sets: "" });

const WeekdayMenuBlock = ({
  label,
  weekday,
  menus,
  draft,
  addError,
  expanded,
  onToggleExpand,
  onDraftChange,
  onAddMenu,
  onMenuChange,
  onRemoveMenu,
}) => (
  <div className="weekday-settings-block">
    <div className="weekday-settings-header">
      <div className="weekday-header-left">
        <div className="weekday-label">{label}</div>
        <div className="weekday-meta-row">
          <span className="menu-count-chip">{menus.length}件のメニュー</span>
          <p className="muted small">よく使うメニューを登録すると追加がスムーズです。</p>
        </div>
      </div>
      <div className="weekday-header-actions">
        <button type="button" className="ds-button ghost" onClick={() => onToggleExpand(weekday)}>
          {expanded ? "折りたたむ" : "一覧を開く"}
        </button>
        <button type="button" className="ds-button secondary" onClick={() => onAddMenu(weekday)}>
          メニューを追加
        </button>
      </div>
    </div>

    <div className="menu-add-panel">
      <div className="menu-add-grid">
        <div className="menu-field">
          <label className="menu-label">メニュー名</label>
          <input
            type="text"
            value={draft?.name ?? ""}
            onChange={(event) => onDraftChange(weekday, "name", event.target.value)}
            placeholder="例: ウォーキング / スクワット"
          />
          <p className="input-hint">名前は必須です。重複登録はできません。</p>
        </div>

        <div className="menu-field">
          <label className="menu-label">タイプ</label>
          <select
            value={draft?.type ?? "reps"}
            onChange={(event) => onDraftChange(weekday, "type", event.target.value)}
          >
            <option value="reps">回数</option>
            <option value="seconds">秒</option>
          </select>
        </div>

        <div className="menu-field">
          <label className="menu-label">{draft?.type === "seconds" ? "目安の秒数" : "目安の回数"}</label>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft?.value ?? ""}
            onChange={(event) => onDraftChange(weekday, "value", event.target.value)}
            placeholder={draft?.type === "seconds" ? "30" : "10"}
          />
        </div>

        <div className="menu-field">
          <label className="menu-label">セット数</label>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft?.sets ?? ""}
            onChange={(event) => onDraftChange(weekday, "sets", event.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      <div className="menu-add-actions">
        {addError && <span className="form-error inline-error">{addError}</span>}
        <button type="button" className="ds-button primary" onClick={() => onAddMenu(weekday)}>
          メニューを追加
        </button>
      </div>
    </div>

    {expanded && (
      <div className="weekday-menu-list">
        {menus.length === 0 && <div className="empty-menu-state">まだメニューがありません</div>}

        {menus.map((menu, index) => (
          <div key={`${label}-${index}`} className="menu-entry">
            <div className="menu-row">
              <label className="menu-label">メニュー名</label>
              <input
                type="text"
                value={menu.name}
                onChange={(event) => onMenuChange(weekday, index, "name", event.target.value)}
                placeholder="例: プッシュアップ"
              />
            </div>

            <div className="menu-row menu-row-grid">
              <div className="menu-field">
                <label className="menu-label">タイプ</label>
                <select
                  value={menu.type}
                  onChange={(event) => onMenuChange(weekday, index, "type", event.target.value)}
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
                  onChange={(event) => onMenuChange(weekday, index, "value", event.target.value)}
                />
              </div>

              <div className="menu-field">
                <label className="menu-label">セット数</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={menu.sets}
                  onChange={(event) => onMenuChange(weekday, index, "sets", event.target.value)}
                />
              </div>
            </div>

            <div className="menu-actions">
              <button
                type="button"
                className="ds-button ghost danger-text"
                onClick={() => onRemoveMenu(weekday, index)}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function WorkoutSettings() {
  const [plans, setPlans] = useState(() => loadDailyFixedWorkouts());
  const [saveStatus, setSaveStatus] = useState("");
  const [newMenuDrafts, setNewMenuDrafts] = useState(() =>
    weekdayLabels.reduce((acc, _, index) => ({ ...acc, [index]: createEmptyMenu() }), {}),
  );
  const [addErrors, setAddErrors] = useState({});
  const [expandedWeekdays, setExpandedWeekdays] = useState(() =>
    weekdayLabels.reduce((acc, _, index) => ({ ...acc, [index]: false }), {}),
  );

  const { data: fitbitData, loading: fitbitLoading, error: fitbitError, refresh } = useFitbitToday();

  const handleAddMenu = (weekday) => {
    const draft = newMenuDrafts?.[weekday] ?? createEmptyMenu();
    const trimmedName = (draft.name || "").trim();
    const prevMenus = plans?.[weekday]?.menus ?? [];

    if (!trimmedName) {
      setAddErrors((prev) => ({ ...prev, [weekday]: "メニュー名を入力してください" }));
      return;
    }

    const isDuplicate = prevMenus.some((menu) => (menu.name || "").trim() === trimmedName);

    if (isDuplicate) {
      setAddErrors((prev) => ({ ...prev, [weekday]: "同じ名前がすでに登録されています" }));
      return;
    }

    setPlans((prev) => ({
      ...prev,
      [weekday]: { menus: [...prevMenus, { ...draft, name: trimmedName }] },
    }));
    setNewMenuDrafts((prev) => ({ ...prev, [weekday]: createEmptyMenu() }));
    setAddErrors((prev) => ({ ...prev, [weekday]: "" }));
    setExpandedWeekdays((prev) => ({ ...prev, [weekday]: true }));
  };

  const handleDraftChange = (weekday, field, value) => {
    setNewMenuDrafts((prev) => ({
      ...prev,
      [weekday]: { ...(prev?.[weekday] ?? createEmptyMenu()), [field]: value },
    }));
    setAddErrors((prev) => ({ ...prev, [weekday]: "" }));
  };

  const handleToggleExpand = (weekday) => {
    setExpandedWeekdays((prev) => ({ ...prev, [weekday]: !prev?.[weekday] }));
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
        <section className="page settings-page workout-settings-page">
          <header className="page-header settings-header">
            <div>
              <p className="eyebrow">ワークアウト設定</p>
              <h1 className="page-title">毎日のプランと連携をまとめて管理</h1>
              <p className="muted">曜日ごとの固定メニューとFitbit連携を確認して、運動の計画をスムーズに。</p>
            </div>
            <div className="header-actions">
              {saveStatus && <span className="save-status">{saveStatus}</span>}
              <button type="button" className="ds-button primary" onClick={handleSave}>
                設定を保存
              </button>
            </div>
          </header>

          <div className="settings-grid">
            <Card title="デイリー固定ワークアウト設定" className="daily-plan-card">
              <p className="muted">
                曜日ごとに固定のワークアウトメニューを登録しておくと、毎日のプランをすぐに確認できます。
              </p>

              <div className="weekday-settings-grid">
                {weekdayLabels.map((label, weekday) => {
                  const menus = plans?.[weekday]?.menus ?? [];
                  return (
                    <WeekdayMenuBlock
                      key={label}
                      label={label}
                      weekday={weekday}
                      menus={menus}
                      draft={newMenuDrafts?.[weekday]}
                      addError={addErrors?.[weekday]}
                      expanded={expandedWeekdays?.[weekday] ?? false}
                      onToggleExpand={handleToggleExpand}
                      onDraftChange={handleDraftChange}
                      onAddMenu={handleAddMenu}
                      onMenuChange={handleMenuChange}
                      onRemoveMenu={handleRemoveMenu}
                    />
                  );
                })}
              </div>
            </Card>

            <Card title="Fitbit連携" className="fitbit-card">
              <div className="fitbit-header">
                <p className="muted">Fitbitアカウントを連携すると、今日のアクティビティデータを自動で取得できます。</p>
                <button type="button" className="ds-button secondary" onClick={refresh}>
                  再読み込み
                </button>
              </div>

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
                <div className="helper-note">連携でデータ入力が短縮できます</div>
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
