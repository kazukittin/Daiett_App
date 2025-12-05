import React, { useState } from "react";
import { getTodayISO } from "../utils/date.js";
import { useToast } from "./ui/ToastProvider.jsx";
import { useStreak } from "../hooks/useStreak.js";
import WeightEntryForm from "./WeightEntryForm.jsx";

export default function WeightDialog({ onClose, onSaved }) {
  const toast = useToast();
  const { recordToday } = useStreak();

  const handleLogged = (data) => {
    recordToday();
    toast.success("体重を記録しました");
    onSaved?.(data);
    onClose?.();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 40,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>体重を追加</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ×
          </button>
        </div>
        <WeightEntryForm
          mode="modal"
          onLogged={handleLogged}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
