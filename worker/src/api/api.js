const BASE_URL = "http://localhost:5000";

export const registerScan = async (data) => {
  const res = await fetch(`${BASE_URL}/api/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
};

