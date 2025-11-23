// src/components/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  { label: "ダッシュボード", path: "/" },
  { label: "摂取カロリー", path: "/intake" },
  { label: "消費カロリー", path: "/burn" },
  { label: "固定ワークアウト設定", path: "/workouts/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">DAIETT</div>

      <div>
        <div className="nav-section-title">メニュー</div>
        <ul className="nav-list">
          {menu.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className="nav-icon" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 下部：クイックアクション */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-action-btn meal"
          onClick={() => navigate("/meals/new")}
        >
          🍙 食事を追加
        </button>

        <button
          className="sidebar-action-btn exercise"
          onClick={() => navigate("/exercises/new")}
        >
          💪 運動記録を追加
        </button>
      </div>
    </aside>
  );
}
