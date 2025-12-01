import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import WeightLog from "../../components/WeightLog.jsx";

export default function AddWeight({ profile }) {
  const { addWeightRecord, latestRecord, previousRecord } = useWeightRecords();

  const latestWeight = latestRecord?.weight ?? null;
  const previousWeight = previousRecord?.weight ?? null;
  const weightDiff =
    latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="page add-weight-page">
          <header className="page-header">
            <p className="eyebrow">体重記録</p>
            <h1 className="page-title">今日の体重をサクッと入力</h1>
            <p className="muted">最近の記録との差分を確認しながら、毎日の変化を見逃さないようにしましょう。</p>
          </header>

          <div className="add-weight-layout">
            <WeightLog
              onSave={addWeightRecord}
              latestRecord={latestRecord}
              previousRecord={previousRecord}
              profile={profile}
            />

            <aside className="ds-card compact info-card">
              <div className="ds-card-title">最近の状態</div>
              <ul className="summary-list">
                <li className="summary-item">
                  <span>最新の体重</span>
                  <strong>{latestWeight !== null ? `${latestWeight} kg` : "-"}</strong>
                </li>
                <li className="summary-item">
                  <span>前回比</span>
                  <strong>
                    {weightDiff === null
                      ? "-"
                      : `${weightDiff > 0 ? "+" : ""}${weightDiff.toFixed(1)} kg`}
                  </strong>
                </li>
                <li className="summary-item">
                  <span>メモリマインダー</span>
                  <strong>毎日1回の記録が理想</strong>
                </li>
              </ul>

              <div className="tip-list">
                <div className="tip-pill">同じ時間帯で測定</div>
                <div className="tip-pill">軽装・空腹時がベター</div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
