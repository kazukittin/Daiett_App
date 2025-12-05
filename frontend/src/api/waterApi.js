const API_BASE = "http://localhost:4000/api/water";

export async function getWaterRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}?${query}`);
    if (!res.ok) throw new Error("Failed to fetch water records");
    return res.json();
}

export async function addWaterRecord(data) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add water record");
    return res.json();
}

export async function deleteWaterRecord(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete water record");
    return true;
}
