import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import SummaryCard from "../../components/ui/SummaryCard.jsx";
import Card from "../../components/ui/Card.jsx";
import WeightTrackerCard from "../../components/weight/WeightTrackerCard.jsx";
import WeightTrendCard from "../../components/weight/WeightTrendCard.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";
import { calculateDifference, calculateMonthOverMonth } from "../../utils/weight.js";

export default function HomeDashboard() {
  const { weightRecords, latestRecord, previousRecord, addWeightRecord, targetWeight } =
    useWeightRecords();

  const difference = calculateDifference(weightRecords);
  const { currentAverage, difference: monthDifference } = calculateMonthOverMonth(weightRecords);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">ホーム / <span>概要</span></div>
          <span className="badge">今日の記録を確認</span>
        </header>

        <section className="content-grid">
          <div className="summary-cards-row">
            <SummaryCard
              label="現在の体重"
              value={latestRecord ? `${latestRecord.weight.toFixed(1)} kg` : "--"}
              helper={previousRecord ? "前回との差" : "初回の記録を追加しましょう"}
              trend={previousRecord ? difference : undefined}
            />

            <SummaryCard
              label="目標体重"
              value={`${targetWeight.toFixed(1)} kg`}
              helper="目標との差"
              trend={latestRecord ? latestRecord.weight - targetWeight : undefined}
            />

            <SummaryCard
              label="今月の平均"
              value={
                currentAverage || currentAverage === 0
                  ? `${currentAverage.toFixed(1)} kg`
                  : "--"
              }
              helper="平均体重"
            />

            <SummaryCard
              label="月次の変化"
              value={
                monthDifference || monthDifference === 0
                  ? `${monthDifference > 0 ? "+" : ""}${monthDifference.toFixed(1)} kg`
                  : "--"
              }
              helper="先月比"
              trend={monthDifference ?? undefined}
            />
          </div>

          <div className="grid-2">
            <WeightTrackerCard
              onSave={addWeightRecord}
              latestRecord={latestRecord}
              previousRecord={previousRecord}
            />
            <WeightTrendCard records={weightRecords} />
          </div>

          <div className="grid-3">
            <Card title="デイリーステップス">
              <div className="metric-highlight">
                <h2>8,526</h2>
                <small>目標の 82% 達成</small>
              </div>
            </Card>
            <Card title="現在の気分">
              <div className="metric-highlight">
                <h2>エネルギッシュ</h2>
                <small>睡眠時間: 7h 30m</small>
              </div>
            </Card>
            <Card title="消費カロリー">
              <div className="metric-highlight">
                <h2>649 kcal</h2>
                <small>前日比 +42 kcal</small>
              </div>
            </Card>
          </div>

          <div className="grid-2">
            <Card title="食事ログ">
              <div className="chip-row">
                {["追加", "ビュー", "編集", "削除", "履歴"].map((action) => (
                  <span key={action} className="chip">
                    {action}
                  </span>
                ))}
              </div>
            </Card>
            <Card title="睡眠分析">
              <div className="sleep-grid">
                <div className="sleep-item">
                  <div className="sleep-label">REM の期間</div>
                  <div className="sleep-value">22%</div>
                </div>
                <div className="sleep-item">
                  <div className="sleep-label">ディープスリープ</div>
                  <div className="sleep-value">52%</div>
                </div>
                <div className="sleep-item">
                  <div className="sleep-label">ライトスリープ</div>
                  <div className="sleep-value">16%</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid-2">
            <Card title="カロリック概要">
              <ul className="summary-list">
                <li className="summary-item">
                  <span>総摂取量</span>
                  <strong>2,700 kcal</strong>
                </li>
                <li className="summary-item">
                  <span>炭水化物</span>
                  <strong>163 g</strong>
                </li>
                <li className="summary-item">
                  <span>脂肪摂取</span>
                  <strong>53 g</strong>
                </li>
              </ul>
            </Card>

            <Card title="今後のお食事">
              <ul className="upcoming-list">
                <li>イブニングジョグ</li>
                <li>サラダでランチ</li>
                <li>マインドフルイーティング</li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
