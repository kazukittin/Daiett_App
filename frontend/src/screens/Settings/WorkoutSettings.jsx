import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { weekdayLabels } from "../../utils/date.js";
import { getWorkoutSettings, saveWorkoutSettings as saveWorkoutSettingsApi } from "../../api/workouts.js";

const createEmptyMenu = () => ({ name: "", type: "reps", value: "", sets: "" });
const menuKey = (weekday, index) => `${weekday}-${index}`;

// 新規追加フォームは1枚のカードにまとめ、既存リストとの差を明確化。
const WorkoutMenuAddForm = ({ draft, weekday, onWeekdayChange, onDraftChange, onAddMenu, addError }) => (
  <div className="workout-menu-add-card">
    <div className="section-header">
      <div>
        <h3 className="section-title">新しいワークアウトメニューを追加</h3>
        <p className="muted small">よく使うメニューを登録しておくと、追加がスムーズになります。</p>
      </div>
    </div>

    <div className="menu-add-panel spacious">
      <div className="menu-add-grid wide">
        <div className="menu-field">
          <label className="menu-label">曜日</label>
          <select value={weekday} onChange={(event) => onWeekdayChange(Number(event.target.value))}>
            {weekdayLabels.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="menu-field">
          <label className="menu-label">メニュー名</label>
          <input
            type="text"
            value={draft?.name ?? ""}
            onChange={(event) => onDraftChange("name", event.target.value)}
            placeholder="例: ウォーキング / スクワット"
          />
          <p className="input-hint">名前は必須です。重複登録はできません。</p>
        </div>

        <div className="menu-field">
          <label className="menu-label">タイプ</label>
          <select value={draft?.type ?? "reps"} onChange={(event) => onDraftChange("type", event.target.value)}>
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
            onChange={(event) => onDraftChange("value", event.target.value)}
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
            onChange={(event) => onDraftChange("sets", event.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      <div className="menu-add-actions">
        {addError && <span className="form-error inline-error">{addError}</span>}
        <button type="button" className="ds-button primary" onClick={onAddMenu}>
          メニューを追加
        </button>
      </div>
    </div>
  </div>
);

const WorkoutMenuRow = ({
  weekday,
  index,
  menu,
  draft,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onDelete,
}) => (
  <div className={`workout-menu-row ${isEditing ? "editing" : ""}`}>
    <div className="workout-menu-row-main">
      <div className="workout-menu-heading">
        <div className="workout-menu-title">{menu.name || "名称未設定"}</div>
        <div className="workout-menu-type muted small">{menu.type === "seconds" ? "時間メニュー" : "回数メニュー"}</div>
      </div>

      {isEditing ? (
        <div className="menu-row menu-row-grid">
          <div className="menu-field">
            <label className="menu-label">メニュー名</label>
            <input
              type="text"
              value={draft?.name ?? ""}
              onChange={(event) => onChange(weekday, index, "name", event.target.value)}
            />
          </div>
          <div className="menu-field">
            <label className="menu-label">タイプ</label>
            <select
              value={draft?.type ?? "reps"}
              onChange={(event) => onChange(weekday, index, "type", event.target.value)}
            >
              <option value="reps">回数</option>
              <option value="seconds">秒</option>
            </select>
          </div>
          <div className="menu-field">
            <label className="menu-label">{draft?.type === "seconds" ? "秒" : "回数"}</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={draft?.value ?? ""}
              onChange={(event) => onChange(weekday, index, "value", event.target.value)}
            />
          </div>
          <div className="menu-field">
            <label className="menu-label">セット数</label>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={draft?.sets ?? ""}
              onChange={(event) => onChange(weekday, index, "sets", event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="workout-menu-meta">
          <div>
            <span className="muted small">タイプ</span>
            <strong>{menu.type === "seconds" ? "時間" : "回数"}</strong>
          </div>
          <div>
            <span className="muted small">{menu.type === "seconds" ? "目安の秒数" : "目安の回数"}</span>
            <strong>{menu.value || 0}</strong>
          </div>
          <div>
            <span className="muted small">セット数</span>
            <strong>{menu.sets || 0}</strong>
          </div>
        </div>
      )}
    </div>

    <div className="workout-menu-actions">
      {isEditing ? (
        <>
          <button type="button" className="ds-button secondary" onClick={() => onSave(weekday, index)}>
            保存
          </button>
          <button type="button" className="ds-button ghost" onClick={() => onCancel(weekday, index)}>
            キャンセル
          </button>
        </>
      ) : (
        <>
          <button type="button" className="ds-button ghost" onClick={() => onEdit(weekday, index)}>
            編集
          </button>
          <button type="button" className="ds-button ghost danger-text" onClick={() => onDelete(weekday, index)}>
            削除
          </button>
        </>
      )}
    </div>
  </div>
);

const WorkoutMenuList = ({
  label,
  weekday,
  menus,
  editingMenus,
  editDrafts,
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
  onDelete,
}) => (
  <div className="weekday-settings-block compact-list">
    <div className="weekday-settings-header">
      <div className="weekday-header-left">
        <div className="weekday-label">{label}</div>
        <div className="weekday-meta-row">
          <span className="menu-count-chip">{menus.length}件のメニュー</span>
          <p className="muted small">登録済みメニューはここから編集できます。</p>
        </div>
      </div>
    </div>

    <div className="weekday-menu-list simple">
      {menus.length === 0 && <div className="empty-menu-state">まだメニューがありません</div>}
      {menus.map((menu, index) => {
        const key = menuKey(weekday, index);
        const isEditing = !!editingMenus[key];
        const draft = isEditing ? editDrafts[key] : menu;
        return (
          <WorkoutMenuRow
            key={key}
            weekday={weekday}
            index={index}
            menu={menu}
            draft={draft}
            isEditing={isEditing}
            onEdit={onEdit}
            onChange={onDraftChange}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  </div>
);

export default function WorkoutSettings() {
  const [plans, setPlans] = useState(() => ({}));
  const [saveStatus, setSaveStatus] = useState("");
  const [newMenuDraft, setNewMenuDraft] = useState(createEmptyMenu());
  const [addError, setAddError] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState(0);
  const [editingMenus, setEditingMenus] = useState({});
  const [editDrafts, setEditDrafts] = useState({});


  useEffect(() => {
    getWorkoutSettings()
      .then((settings) => setPlans(settings))
      .catch((error) => console.error("Failed to load workout settings", error));
  }, []);

  const handleAddMenu = () => {
    const draft = newMenuDraft ?? createEmptyMenu();
    const trimmedName = (draft.name || "").trim();
    const prevMenus = plans?.[selectedWeekday]?.menus ?? [];

    if (!trimmedName) {
      setAddError("メニュー名を入力してください");
      return;
    }

    const isDuplicate = prevMenus.some((menu) => (menu.name || "").trim() === trimmedName);
    if (isDuplicate) {
      setAddError("同じ名前がすでに登録されています");
      return;
    }

    setPlans((prev) => ({
      ...prev,
      [selectedWeekday]: { menus: [...prevMenus, { ...draft, name: trimmedName }] },
    }));
    setNewMenuDraft(createEmptyMenu());
    setAddError("");
  };

  const handleDraftChange = (field, value) => {
    setNewMenuDraft((prev) => ({ ...prev, [field]: value }));
    setAddError("");
  };

  const handleEditDraftChange = (weekday, index, field, value) => {
    const key = menuKey(weekday, index);
    setEditDrafts((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), [field]: value } }));
  };

  const handleStartEdit = (weekday, index) => {
    const currentMenu = plans?.[weekday]?.menus?.[index];
    if (!currentMenu) return;
    const key = menuKey(weekday, index);
    setEditingMenus((prev) => ({ ...prev, [key]: true }));
    setEditDrafts((prev) => ({ ...prev, [key]: { ...currentMenu } }));
  };

  const handleCancelEdit = (weekday, index) => {
    const key = menuKey(weekday, index);
    setEditingMenus((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSaveMenu = (weekday, index) => {
    const key = menuKey(weekday, index);
    const draft = editDrafts[key];
    if (!draft) return;
    const trimmedName = (draft.name || "").trim();
    if (!trimmedName) return;

    setPlans((prev) => {
      const prevMenus = prev?.[weekday]?.menus ?? [];
      if (!prevMenus[index]) return prev;
      const isDuplicate = prevMenus.some(
        (menu, idx) => idx !== index && (menu.name || "").trim() === trimmedName,
      );
      if (isDuplicate) return prev;
      const updatedMenus = prevMenus.map((menu, idx) =>
        idx === index ? { ...menu, ...draft, name: trimmedName } : menu,
      );
      return { ...prev, [weekday]: { menus: updatedMenus } };
    });

    setEditingMenus((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleRemoveMenu = (weekday, menuIndex) => {
    setPlans((prev) => {
      const prevMenus = prev?.[weekday]?.menus ?? [];
      const nextMenus = prevMenus.filter((_, index) => index !== menuIndex);
      return { ...prev, [weekday]: { menus: nextMenus } };
    });
    handleCancelEdit(weekday, menuIndex);
  };

  const handleSave = () => {
    saveWorkoutSettingsApi(plans)
      .then((normalized) => {
        setPlans(normalized);
        setSaveStatus("保存しました");
        setTimeout(() => setSaveStatus(""), 2500);
      })
      .catch(() => setSaveStatus("保存に失敗しました"));
  };

  return (
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

          <WorkoutMenuAddForm
            draft={newMenuDraft}
            weekday={selectedWeekday}
            addError={addError}
            onDraftChange={handleDraftChange}
            onWeekdayChange={setSelectedWeekday}
            onAddMenu={handleAddMenu}
          />

          <div className="workout-menu-list-section">
            <div className="section-header">
              <div>
                <h3 className="section-title">登録済みメニュー</h3>
                <p className="muted small">保存済みメニューは「編集」から内容を更新できます。</p>
              </div>
            </div>
            <div className="weekday-settings-grid compact">
              {weekdayLabels.map((label, weekday) => {
                const menus = plans?.[weekday]?.menus ?? [];
                return (
                  <WorkoutMenuList
                    key={label}
                    label={label}
                    weekday={weekday}
                    menus={menus}
                    editingMenus={editingMenus}
                    editDrafts={editDrafts}
                    onEdit={handleStartEdit}
                    onDraftChange={handleEditDraftChange}
                    onSave={handleSaveMenu}
                    onCancel={handleCancelEdit}
                    onDelete={handleRemoveMenu}
                  />
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
