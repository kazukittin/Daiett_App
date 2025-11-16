// src/pages/HomeDashboardPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import "../App.css";

export default function HomeDashboardPage() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            ホーム / <span>概要</span>
          </div>
        </header>

        <section className="content">
          {/* Welcome カード */}
          <div className="row-single">
            <div className="card card-highlight">
              <div className="card-highlight-title">Welcome Back !</div>
              <div className="card-highlight-text">
                今日は1月12日火曜日です。1,500 カロリーを消費しましたが、
                目標を達成するにはあと 500 カロリーです。持ちこたえて！
              </div>
            </div>
          </div>

          {/* 上段：3つのカード */}
          <div className="row-3">
            <div className="card metric-card">
              <div className="metric-label">デイリーステップス</div>
              <div className="metric-value">8,526</div>
            </div>
            <div className="card metric-card">
              <div className="metric-label">現在の気分</div>
              <div className="metric-value">エネルギッシュ</div>
            </div>
            <div className="card metric-card">
              <div className="metric-label">消費カロリー</div>
              <div className="metric-value">649 kcal</div>
            </div>
          </div>

          {/* 中段 row */}
          <div className="row">
            {/* 食事ログ */}
            <div className="card">
              <div className="section-title">食事ログ</div>
              <div className="log-actions">
                <button className="chip-button">追加</button>
                <button className="chip-button">ビュー</button>
                <button className="chip-button">編集</button>
                <button className="chip-button">削除</button>
                <button className="chip-button">履歴</button>
              </div>
            </div>

            {/* 睡眠分析 */}
            <div className="card">
              <div className="section-title">睡眠分析</div>

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
            </div>
          </div>

          {/* 下段 row */}
          <div className="row">
            {/* カロリック概要 */}
            <div className="card">
              <div className="section-title">カロリックの概要</div>

              <div className="cal-summary">
                <div className="cal-row">
                  <div className="cal-label">総摂取量</div>
                  <div className="cal-values">
                    <span>2,700 kcal</span>
                    <span className="cal-sub">現在の</span>
                  </div>
                  <div className="cal-bar">
                    <div className="cal-bar-fill" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="cal-row">
                  <div className="cal-label">炭水化物の摂取</div>
                  <div className="cal-values">
                    <span>163g</span>
                    <span className="cal-sub">デイリー</span>
                  </div>
                  <div className="cal-bar">
                    <div className="cal-bar-fill" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="cal-row">
                  <div className="cal-label">脂肪摂取</div>
                  <div className="cal-values">
                    <span>53g</span>
                    <span className="cal-sub">残り</span>
                  </div>
                  <div className="cal-bar">
                    <div className="cal-bar-fill" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 今後のお食事 */}
            <div className="card">
              <div className="section-title">今後のお食事</div>
              <ul className="upcoming-list">
                <li>イブニングジョグ</li>
                <li>サラダでランチ</li>
                <li>マインドフルイーティング</li>
              </ul>

              <button className="profile-update-btn">
                プロファイルを更新します
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
