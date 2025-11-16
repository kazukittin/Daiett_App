// src/pages/DashboardPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import "../App.css";

export default function DashboardPage() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            ホーム / <span>摂取カロリー</span>
          </div>
        </header>

        <section className="content">
          <div className="row-single">
            <div className="card card-highlight">
              <div className="card-highlight-title">摂取カロリー</div>
              <div className="card-highlight-text">
                今日の食事データをここで確認できます。
              </div>
            </div>
          </div>

          <div className="row">
            <div className="card">
              <div className="section-title">今日の摂取カロリー</div>

              <h2 className="big-number">1,200 kcal</h2>

              <div className="cal-summary">
                <div className="cal-row">
                  <div className="cal-label">朝食</div>
                  <div className="cal-values">
                    <span>320 kcal</span>
                  </div>
                </div>

                <div className="cal-row">
                  <div className="cal-label">昼食</div>
                  <div className="cal-values">
                    <span>540 kcal</span>
                  </div>
                </div>

                <div className="cal-row">
                  <div className="cal-label">夕食</div>
                  <div className="cal-values">
                    <span>340 kcal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">食品ログ</div>
              <ul className="upcoming-list">
                <li>ごはん 150g — 252 kcal</li>
                <li>味噌汁 — 80 kcal</li>
                <li>サラダ — 120 kcal</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
