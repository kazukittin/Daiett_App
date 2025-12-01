// src/components/Sidebar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  { label: "ダッシュボード", path: "/" },
  { label: "摂取カロリー", path: "/intake" },
  { label: "消費カロリー", path: "/burn" },
  { label: "ワークアウト設定", path: "/settings/workouts" },
];

export default function Sidebar({ onAddWeightClick, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    navigate(path);
  };

  const handleAddWeight = () => {
    if (onAddWeightClick) {
      onAddWeightClick();
      return;
    }
    navigate("/weight/new");
  };

  return (
    <aside className="sidebar">
      <div>
        <ul className="nav-list">
          {menu.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => handleNavigate(item.path)}
            >
              <div className="nav-icon" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-action-btn weight" onClick={handleAddWeight}>
          ⚖️ 体重を追加
        </button>

        <button className="sidebar-action-btn meal" onClick={() => handleNavigate("/meals/new")}>
          🍙 食事を追加
        </button>

        <button className="sidebar-action-btn exercise" onClick={() => handleNavigate("/exercises/new")}>
          💪 運動記録を追加
        </button>
      </div>
    </aside>
  );
}
