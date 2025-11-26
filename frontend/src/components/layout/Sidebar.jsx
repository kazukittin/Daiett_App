// src/components/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  { label: "ダッシュボード", path: "/" },
  { label: "摂取カロリー", path: "/intake" },
  { label: "消費カロリー", path: "/burn" },
  { label: "ワークアウト設定", path: "/settings/workouts" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">

      <div>
        <ul className="nav-list">
          {menu.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""
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
          className="sidebar-action-btn weight"
          onClick={() => navigate("/weight/new")}
        >
          ⚖️ 体重を追加
        </button>

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
