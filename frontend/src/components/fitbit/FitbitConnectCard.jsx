import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";
import { startFitbitAuth } from "../../services/fitbitApi.js";
import { useFitbitToday } from "../../hooks/useFitbitToday.js";

export default function FitbitConnectCard() {
  const { data: fitbitData, loading: fitbitLoading, error: fitbitError, refresh } = useFitbitToday();
  const fitbitSummary = useMemo(() => fitbitData?.summary, [fitbitData]);

  return (
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
          <div className="status-label">{fitbitData?.connected ? "Fitbitと連携済み" : "未連携"}</div>
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
  );
}
