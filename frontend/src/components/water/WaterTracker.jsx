import React, { useState, useEffect } from "react";
import { getWaterRecords, addWaterRecord, deleteWaterRecord } from "../../api/waterApi";
import { getTodayISO } from "../../utils/date";

export default function WaterTracker({ onUpdate }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const today = getTodayISO();

    const fetchRecords = async () => {
        try {
            const data = await getWaterRecords({ date: today });
            setRecords(data);
            if (onUpdate) {
                const total = data.reduce((sum, r) => sum + r.amount, 0);
                onUpdate(total);
            }
        } catch (error) {
            console.error("Failed to load water records", error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [today]);

    const handleAdd = async (amount) => {
        setLoading(true);
        try {
            await addWaterRecord({ amount, date: today });
            await fetchRecords();
        } catch (error) {
            console.error("Failed to add water", error);
        } finally {
            setLoading(false);
        }
    };

    const totalWater = records.reduce((sum, r) => sum + r.amount, 0);
    // Goal is 2000ml (example default)
    const goal = 2000;
    const percentage = Math.min(100, Math.round((totalWater / goal) * 100));

    return (
        <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    💧 水分補給
                </h3>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#3b82f6" }}>
                    {totalWater} <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>/ {goal}ml</span>
                </span>
            </div>

            <div style={{
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "6px",
                overflow: "hidden",
                marginBottom: "16px"
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #60a5fa, #3b82f6)",
                    transition: "width 0.5s ease"
                }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <button
                    onClick={() => handleAdd(150)}
                    disabled={loading}
                    className="btn-secondary"
                    style={{ padding: "8px", fontSize: "0.9rem" }}
                >
                    +150ml
                </button>
                <button
                    onClick={() => handleAdd(250)}
                    disabled={loading}
                    className="btn-secondary"
                    style={{ padding: "8px", fontSize: "0.9rem" }}
                >
                    +250ml
                </button>
                <button
                    onClick={() => handleAdd(500)}
                    disabled={loading}
                    className="btn-secondary"
                    style={{ padding: "8px", fontSize: "0.9rem" }}
                >
                    +500ml
                </button>
            </div>
        </div>
    );
}
