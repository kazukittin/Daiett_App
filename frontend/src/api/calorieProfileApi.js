const BASE_URL = "http://localhost:4000/api/calories";

export async function fetchCalorieProfile() {
  const response = await fetch(`${BASE_URL}/profile`);
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("プロファイルの取得に失敗しました。");
  }

  const data = await response.json();
  return data.profile;
}

export async function saveCalorieProfile(profile) {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "プロファイルの保存に失敗しました。");
  }

  const data = await response.json();
  return data.profile;
}

export async function clearCalorieProfile() {
  const response = await fetch(`${BASE_URL}/profile`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "プロファイルの削除に失敗しました。");
  }
}
