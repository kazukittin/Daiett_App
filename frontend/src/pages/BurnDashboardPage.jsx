// src/pages/BurnDashboardPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import "../App.css";

export default function BurnDashboardPage() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            ホーム / <span>消費カロリー</span>
          </div>
        </header>

        <section className="content">
          <div className="row-single">
            <div className="card card-highlight">
              <div className="card-highlight-title">今日の消費カロリー</div>
              <div className="card-highlight-text">
                運動や日常の活動による消費カロリーをここで確認できます。
                あとでグラフやアクティビティ別の内訳を追加していく想定です。
              </div>
            </div>
          </div>

          <div className="row">
            <div className="card">
              <div className="section-title">週間の消費カロリー</div>
              <div className="fake-chart">
                <div className="bar" style={{ height: "60%" }} />
                <div className="bar" style={{ height: "75%" }} />
                <div className="bar" style={{ height: "50%" }} />
                <div className="bar" style={{ height: "80%" }} />
                <div className="bar" style={{ height: "70%" }} />
                <div className="bar" style={{ height: "65%" }} />
              </div>
              <div className="bar-labels">
                <span>月</span>
                <span>火</span>
                <span>水</span>
                <span>木</span>
                <span>金</span>
                <span>土</span>
              </div>
            </div>

            <div className="card">
              <div className="section-title">アクティビティの内訳</div>
              <ul className="upcoming-list">
                <li>ウォーキング： 230 kcal</li>
                <li>ランニング： 320 kcal</li>
                <li>筋トレ： 110 kcal</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
