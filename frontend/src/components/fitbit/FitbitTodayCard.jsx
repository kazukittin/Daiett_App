import React from "react";
import Card from "../ui/Card.jsx";
import { useFitbitToday } from "../../hooks/useFitbitToday.js";
import { startFitbitAuth } from "../../services/fitbitApi.js";

export default function FitbitTodayCard() {
  const { data, loading, error, refresh } = useFitbitToday();
  const summary = data?.summary;

  return (
    <Card
      title="Fitbit アクティビティ"
      action={
        <button type="button" className="ds-button ghost" onClick={refresh}>
          再読み込み
        </button>
      }
    >
      {loading && <div className="muted">Fitbitデータを取得中...</div>}

      {!loading && error && <div className="form-error">{error}</div>}

      {!loading && !data?.connected && !error && (
        <div className="fitbit-connect-callout">
          <p className="muted">
            Fitbitと連携すると、歩数や消費カロリーなどのアクティビティを自動で読み込みます。
          </p>
          <button type="button" className="ds-button primary" onClick={startFitbitAuth}>
            Fitbitと連携する
          </button>
        </div>
      )}

      {!loading && data?.connected && summary && (
        <div className="fitbit-today-grid">
          <div className="fitbit-metric">
            <span className="muted">歩数</span>
            <strong>{summary.steps?.toLocaleString?.() ?? "-"}</strong>
          </div>
          <div className="fitbit-metric">
            <span className="muted">消費カロリー</span>
            <strong>{summary.caloriesOut ? `${summary.caloriesOut} kcal` : "-"}</strong>
          </div>
          <div className="fitbit-metric">
            <span className="muted">アクティブ分数</span>
            <strong>{summary.activeMinutes ?? "-"} 分</strong>
          </div>
          {summary.restingHeartRate !== undefined && (
            <div className="fitbit-metric">
              <span className="muted">安静時心拍数</span>
              <strong>{summary.restingHeartRate} bpm</strong>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
