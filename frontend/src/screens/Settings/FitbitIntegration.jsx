import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import { fetchFitbitStatus, fetchFitbitToday, startFitbitAuth } from "../../services/fitbitApi.js";

export default function FitbitIntegration() {
  const [status, setStatus] = useState({ connected: false, lastSync: null });
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    try {
      const nextStatus = await fetchFitbitStatus();
      setStatus(nextStatus);
    } catch (fetchError) {
      setError("Fitbitの状態を取得できませんでした");
    }
  };

  const loadToday = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFitbitToday();
      setTodayData(data);
      setStatus((prev) => ({ ...prev, connected: true, lastSync: new Date().toISOString() }));
    } catch (fetchError) {
      setError("Fitbitデータの取得に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">ホーム / 設定 / <span>Fitbit連携</span></div>
        </header>

        <section className="page">
          <header className="page-header">
            <h1 className="page-title">Fitbit連携</h1>
            <p className="muted">Fitbitアカウントを連携して、歩数やアクティビティデータを取得します。</p>
          </header>

          <div className="grid-2">
            <Card title="接続状況">
              <div className="fitbit-status">
                <div className={`badge ${status.connected ? "success" : "warning"}`}>
                  {status.connected ? "接続済み" : "未接続"}
                </div>
                <p className="muted">
                  {status.lastSync ? `最終同期: ${new Date(status.lastSync).toLocaleString()}` : "まだ同期はありません"}
                </p>

                <div className="fitbit-actions">
                  <button type="button" className="btn primary" onClick={startFitbitAuth}>
                    Fitbitと連携する
                  </button>
                  <button type="button" className="btn secondary" onClick={loadToday} disabled={loading}>
                    {loading ? "取得中..." : "今日のデータを取得"}
                  </button>
                </div>
              </div>

              {error && <div className="form-error" style={{ marginTop: "0.75rem" }}>{error}</div>}
            </Card>

            <Card title="今日のFitbitデータ">
              {todayData ? (
                <ul className="summary-list">
                  <li className="summary-item">
                    <span>歩数</span>
                    <strong>{todayData.steps ?? "--"}</strong>
                  </li>
                  <li className="summary-item">
                    <span>消費カロリー</span>
                    <strong>{todayData.caloriesOut ?? "--"} kcal</strong>
                  </li>
                  <li className="summary-item">
                    <span>アクティブ分</span>
                    <strong>{todayData.activeMinutes ?? "--"} 分</strong>
                  </li>
                  <li className="summary-item">
                    <span>安静時心拍数</span>
                    <strong>{todayData.restingHeartRate ?? "--"}</strong>
                  </li>
                </ul>
              ) : (
                <p className="muted">まだデータがありません。接続後に「今日のデータを取得」を押してください。</p>
              )}
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
