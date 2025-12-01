import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { getWorkoutSettings, saveWorkoutSettings } from "../../api/workouts.js";

const defaultSettings = {
  targetCalories: "",
  weeklyGoal: "",
  preferredActivities: "",
  reminderTime: "",
};

export default function WorkoutSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [status, setStatus] = useState({ loading: true, error: "", saved: false });

  useEffect(() => {
    getWorkoutSettings()
      .then((data) => {
        if (data) {
          setSettings({
            targetCalories: data.targetCalories ?? "",
            weeklyGoal: data.weeklyGoal ?? "",
            preferredActivities: data.preferredActivities ?? "",
            reminderTime: data.reminderTime ?? "",
          });
        }
      })
      .catch(() => setStatus((prev) => ({ ...prev, error: "設定の取得に失敗しました。" })))
      .finally(() => setStatus((prev) => ({ ...prev, loading: false })));
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatus((prev) => ({ ...prev, saved: false, error: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true, error: "", saved: false }));
    try {
      await saveWorkoutSettings(settings);
      setStatus((prev) => ({ ...prev, saved: true }));
    } catch (err) {
      setStatus((prev) => ({ ...prev, error: err?.message || "保存に失敗しました。" }));
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <section className="page settings-page">
      <header className="page-header">
        <p className="eyebrow">設定</p>
        <h1 className="page-title">ワークアウト設定</h1>
        <p className="muted">目標やリマインダーを更新して、トレーニング計画を最適化しましょう。</p>
      </header>

      <form className="settings-form" onSubmit={handleSubmit}>
        <Card title="目標とリマインダー" className="settings-card">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">1日の目標消費カロリー (kcal)</label>
              <input
                type="number"
                min="0"
                value={settings.targetCalories}
                onChange={(event) => updateField("targetCalories", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">週の目標運動回数</label>
              <input
                type="number"
                min="0"
                value={settings.weeklyGoal}
                onChange={(event) => updateField("weeklyGoal", event.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label">好みのアクティビティ</label>
              <input
                type="text"
                value={settings.preferredActivities}
                onChange={(event) => updateField("preferredActivities", event.target.value)}
                placeholder="ランニング、ヨガなど"
              />
            </div>

            <div className="form-field">
              <label className="form-label">リマインダー時間</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(event) => updateField("reminderTime", event.target.value)}
              />
            </div>
          </div>

          {status.error && <p className="form-error">{status.error}</p>}
          {status.saved && <p className="form-success">保存しました。</p>}

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={status.loading}>
              {status.loading ? "保存中..." : "保存する"}
            </Button>
          </div>
        </Card>
      </form>
    </section>
  );
}
