// src/pages/DashboardPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const burnCalorieData = [
  { label: "月", value: 450 },
  { label: "火", value: 520 },
  { label: "水", value: 480 },
  { label: "木", value: 600 },
  { label: "金", value: 530 },
  { label: "土", value: 700 },
  { label: "日", value: 650 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const maxBurn = Math.max(...burnCalorieData.map((d) => d.value));

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">カロリートラッ</div>

        <div>
          <div className="nav-section-title">メニュー</div>
          <ul className="nav-list">
            <li className="nav-item active">
              <div className="nav-icon" />
              <span>日常の概要</span>
            </li>
            <li className="nav-item">
              <div className="nav-icon" />
              <span>食事ログ</span>
            </li>
            <li className="nav-item">
              <div className="nav-icon" />
              <span>栄養計画</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-bottom">
          <button className="btn-add-meal" onClick={() => navigate("/meals/new")}>
            食事を追加します
          </button>
          <div className="sidebar-link">⚙ 環境設定</div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">

        <section className="content">
          {/* 上段 */}
          <div className="row">
            {/* 1日あたりのカロリー */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">1日あたりのカロリー</div>
                  <div className="subtitle">総消費カロリー</div>
                </div>
              </div>
              <div className="big-number">1,450 キロカロリー</div>
            </div>

            {/* 今日のステータス */}
            <div className="card">
              <div className="card-title">今日のステータス</div>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">1日の目標</div>
                  <div className="stat-value">2,000 キロカロリー</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">今日のカロリー</div>
                  <div className="stat-value">1,450 キロカロリー</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">ステータス</div>
                  <div className="stat-value">軌道に乗っている</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">食事数</div>
                  <div className="stat-value">3 食</div>
                </div>
              </div>
            </div>
          </div>

          {/* 中段 */}
          <div className="row">
            {/* 週の概要 */}
            <div className="card">
              <div className="table-title">週の概要</div>
              <table>
                <thead>
                  <tr>
                    <th>日</th>
                    <th>月</th>
                    <th>火</th>
                    <th>水</th>
                    <th>木</th>
                    <th>金</th>
                    <th>土</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>カロリー</td>
                    <td>1,450</td>
                    <td>1,600</td>
                    <td>1,300</td>
                    <td>1,700</td>
                    <td>1,500</td>
                    <td>–</td>
                  </tr>
                  <tr>
                    <td>食事</td>
                    <td>朝/昼/夕</td>
                    <td>朝/昼</td>
                    <td>ランチ</td>
                    <td>朝/昼</td>
                    <td>スナック</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>水</td>
                    <td>2 L</td>
                    <td>1.8 L</td>
                    <td>2.2 L</td>
                    <td>1.5 L</td>
                    <td>2.0 L</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>ステップ</td>
                    <td>5,000</td>
                    <td>6,200</td>
                    <td>4,800</td>
                    <td>7,500</td>
                    <td>10,000</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>総カロリー</td>
                    <td>480</td>
                    <td>620</td>
                    <td>1,050</td>
                    <td>820</td>
                    <td>720</td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td>気分</td>
                    <td className="emoji-cell">🙂</td>
                    <td className="emoji-cell">😄</td>
                    <td className="emoji-cell">😐</td>
                    <td className="emoji-cell">🙂</td>
                    <td className="emoji-cell">😌</td>
                    <td className="emoji-cell">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* あなたの毎日の概要 */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">あなたの毎日の概要</div>
                  <div className="subtitle">体重と進捗のイメージ</div>
                </div>
              </div>

              <div className="stats-grid stats-grid-tight">
                <div className="stat-box">
                  <div className="stat-label">現在の体重</div>
                  <div className="stat-value">65 kg</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">ターゲット体重</div>
                  <div className="stat-value">60 kg</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">体重変化</div>
                  <div className="stat-value">-4.0 %</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">目標 BMI</div>
                  <div className="stat-value">22</div>
                </div>
              </div>

              <div className="chart-tabs">
                <div className="chart-tab active">今日</div>
                <div className="chart-tab">週別</div>
                <div className="chart-tab">月別</div>
                <div className="chart-tab">年別</div>
              </div>

              <div className="fake-chart">
                <div className="bar" style={{ height: "80%" }} />
                <div className="bar" style={{ height: "90%" }} />
                <div className="bar" style={{ height: "70%" }} />
                <div className="bar" style={{ height: "65%" }} />
                <div className="bar" style={{ height: "60%" }} />
                <div className="bar" style={{ height: "62%" }} />
              </div>
              <div className="bar-labels">
                <span>W24</span>
                <span>W25</span>
                <span>W26</span>
                <span>W27</span>
                <span>W28</span>
                <span>W29</span>
              </div>
            </div>
          </div>

          {/* 追加：消費カロリーグラフ */}
          <div className="row-single">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">週間の消費カロリー</div>
                  <div className="subtitle">
                    アクティビティによる消費カロリーの推移
                  </div>
                </div>
              </div>

              <div className="fake-chart">
                {burnCalorieData.map((d) => (
                  <div
                    key={d.label}
                    className="bar burn-bar"
                    style={{ height: `${(d.value / maxBurn) * 100}%` }}
                  />
                ))}
              </div>
              <div className="bar-labels">
                {burnCalorieData.map((d) => (
                  <span key={d.label}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
