import React from "react";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";

export default function AddWeight() {
  const { refresh, latestRecord, previousRecord } = useWeightRecords();

  const latestWeight = latestRecord?.weight ?? null;
  const previousWeight = previousRecord?.weight ?? null;
  const weightDiff =
    latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null;

  return (
    <section className="page add-weight-page">
      <header className="page-header">
        <p className="eyebrow">体重記録</p>
        <h1 className="page-title">今日の体重をサクッと入力</h1>
        <p className="muted">
          サイドバーの「体重を追加」ボタンから登録できます。登録後はグラフや統計を更新します。
        </p>
      </header>

      <div className="add-weight-layout">
        <div className="ds-card compact info-card">
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
        </div>

        <div className="ds-card compact info-card" style={{ alignSelf: "flex-start" }}>
          <div className="ds-card-title">操作</div>
          <p style={{ margin: 0 }}>
            体重の登録は画面左の「体重を追加」ボタンを押してモーダルで入力してください。
          </p>
          <button className="sidebar-action-btn weight" onClick={refresh} style={{ marginTop: 12 }}>
            最新情報をリロード
          </button>
        </div>
      </div>
    </section>
  );
}
