import React, { useEffect, useMemo, useState } from "react";

const apiBase = "http://localhost:4000/api/food-sets";
const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyItem = () => ({ id: crypto.randomUUID(), name: "", calories: "" });

export default function FoodSetManager({ onApplied }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({ id: null, name: "", description: "", items: [emptyItem()] });
  const [error, setError] = useState("");
  const [applyDate, setApplyDate] = useState(todayISO());
  const [mealType, setMealType] = useState("breakfast");
  const [selectedSetId, setSelectedSetId] = useState("");

  const totalCalories = useMemo(
    () => formState.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0),
    [formState.items],
  );

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      const data = await res.json();
      setSets(data.sets || []);
      if (!selectedSetId && data.sets?.length) {
        setSelectedSetId(data.sets[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => setFormState({ id: null, name: "", description: "", items: [emptyItem()] });

  const handleItemChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addRow = () => setFormState((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeRow = (id) =>
    setFormState((prev) => ({ ...prev, items: prev.items.length === 1 ? prev.items : prev.items.filter((i) => i.id !== id) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: formState.name.trim(),
      description: formState.description,
      items: formState.items.map((item) => ({ name: item.name, calories: Number(item.calories) || 0 })),
    };

    if (!payload.name) {
      setError("セット名を入力してください。");
      return;
    }

    if (!payload.items.some((item) => item.name.trim())) {
      setError("食品名を1つ以上入力してください。");
      return;
    }

    const hasNegative = payload.items.some((item) => item.calories < 0 || Number.isNaN(item.calories));
    if (hasNegative) {
      setError("カロリーは0以上の数値で入力してください。");
      return;
    }

    try {
      const method = formState.id ? "PUT" : "POST";
      const url = formState.id ? `${apiBase}/${formState.id}` : apiBase;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || "保存に失敗しました");
      }
      await fetchSets();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "保存に失敗しました");
    }
  };

  const handleEdit = (set) => {
    setFormState({
      id: set.id,
      name: set.name,
      description: set.description ?? "",
      items: set.items.map((item, index) => ({ id: `${set.id}_${index}`, name: item.name, calories: item.calories })),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("このセットを削除しますか？")) return;
    try {
      await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      await fetchSets();
      if (selectedSetId === id) {
        setSelectedSetId("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applySelected = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${apiBase}/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: applyDate, mealType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "セットの適用に失敗しました");
      }
      onApplied?.(data);
      alert(`${data.appliedSetId} を追加しました（+${data.totalCaloriesAdded} kcal）`);
    } catch (err) {
      console.error(err);
      alert(err.message || "セットの適用に失敗しました");
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h3 style={{ margin: "0 0 12px" }}>よく食べる食品セット</h3>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong>{formState.id ? "セットを編集" : "セットを新規登録"}</strong>
            {formState.id && (
              <button
                type="button"
                onClick={resetForm}
                style={{ border: "none", background: "transparent", color: "#2563eb", cursor: "pointer" }}
              >
                新規作成に戻る
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>セット名</span>
              <input
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span>説明（任意）</span>
              <textarea
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>食品アイテム</span>
              <button
                type="button"
                onClick={addRow}
                style={{ border: "none", background: "#2563eb", color: "#fff", padding: "6px 10px", borderRadius: 6 }}
              >
                ＋ 行を追加
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {formState.items.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px", gap: 8, alignItems: "center" }}>
                  <input
                    placeholder="食品名"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
                  />
                  <input
                    type="number"
                    placeholder="kcal"
                    value={item.calories}
                    onChange={(e) => handleItemChange(item.id, "calories", e.target.value)}
                    style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    disabled={formState.items.length === 1}
                    style={{
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: formState.items.length === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>合計カロリー: {totalCalories} kcal</div>
            {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
            <button
              type="submit"
              style={{
                border: "none",
                background: "#16a34a",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {formState.id ? "更新" : "登録"}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              padding: 12,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#4b5563" }}>日付</label>
              <input type="date" value={applyDate} onChange={(e) => setApplyDate(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#4b5563" }}>食事タイプ</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
              <label style={{ fontSize: 12, color: "#4b5563" }}>セットを選択</label>
              <select value={selectedSetId} onChange={(e) => setSelectedSetId(e.target.value)}>
                <option value="">選択してください</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => applySelected(selectedSetId)}
              disabled={!selectedSetId}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 6,
                cursor: selectedSetId ? "pointer" : "not-allowed",
              }}
            >
              このセットを追加
            </button>
          </div>

          {loading && <div>読み込み中...</div>}
          {!loading && sets.length === 0 && <div style={{ color: "#6b7280" }}>登録済みのセットはありません。</div>}

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {sets.map((set) => (
              <div
                key={set.id}
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{set.name}</strong>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>
                    合計 {set.totalCalories ?? set.items.reduce((s, i) => s + (Number(i.calories) || 0), 0)} kcal
                  </span>
                </div>
                {set.description && <div style={{ color: "#4b5563" }}>{set.description}</div>}
                <ul style={{ margin: 0, paddingLeft: 18, color: "#374151" }}>
                  {set.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name}（{item.calories} kcal）
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(set)}
                    style={{ border: "1px solid #d1d5db", background: "#fff", padding: "8px 10px", borderRadius: 6 }}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(set.id)}
                    style={{ border: "1px solid #d1d5db", background: "#fff", padding: "8px 10px", borderRadius: 6 }}
                  >
                    削除
                  </button>
                  <button
                    type="button"
                    onClick={() => applySelected(set.id)}
                    style={{ border: "none", background: "#2563eb", color: "#fff", padding: "8px 10px", borderRadius: 6 }}
                  >
                    このセットを追加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
