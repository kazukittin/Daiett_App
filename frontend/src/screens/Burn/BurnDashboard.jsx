import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Card from "../../components/ui/Card.jsx";
import TodayWorkout from "../../components/Workout/TodayWorkout.jsx";

const weeklyBurn = [60, 75, 50, 80, 70, 65];
const activities = [
  { label: "ウォーキング", calories: 230 },
  { label: "ランニング", calories: 320 },
  { label: "筋トレ", calories: 110 },
];

export default function BurnDashboard() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">

        <section className="content-grid">
          <div className="grid-2">
            <Card title="週間の消費カロリー">
              <div className="fake-chart">
                {weeklyBurn.map((height, index) => (
                  <div key={index} className="bar" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="bar-labels">
                {["月", "火", "水", "木", "金", "土"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </Card>

            <Card title="アクティビティの内訳">
              <ul className="upcoming-list">
                {activities.map((activity) => (
                  <li key={activity.label}>
                    {activity.label}: {activity.calories} kcal
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <TodayWorkout />
        </section>
      </main>
    </div>
  );
}
