import React from "react";
import Sidebar from "../../components/layout/Sidebar.jsx";
import WeightTrackerCard from "../../components/weight/WeightTrackerCard.jsx";
import { useWeightRecords } from "../../hooks/useWeightRecords.js";

export default function AddWeight() {
  const { addWeightRecord, latestRecord, previousRecord } = useWeightRecords();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <section className="content-grid">
          <WeightTrackerCard
            onSave={addWeightRecord}
            latestRecord={latestRecord}
            previousRecord={previousRecord}
          />
        </section>
      </main>
    </div>
  );
}
