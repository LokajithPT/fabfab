const BASE_URL = "http://localhost:5000";

// ---------------- AUTH ----------------
export const signup = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return res.json();
};

export const login = async (data) => {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      throw err;
    } catch {
      throw { error: "Server returned HTML or invalid JSON" };
    }
  }
  return res.json();
};

// ---------------- ORDERS (EMAIL-BASED) ----------------
export const getOrdersByEmail = async (email) => {
  const res = await fetch(`${BASE_URL}/api/orders?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return await res.json();
};

export const createOrderByEmail = async (data) => {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return await res.json();
};

export const updateOrderByEmail = async (id, data) => {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return await res.json();
};

export const deleteOrderById = async (id, email) => {
  const res = await fetch(`${BASE_URL}/api/orders/${id}?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
};

// ---------------- SERVICES ----------------
export const getServices = async () => {
  const res = await fetch(`${BASE_URL}/api/services`);
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return await res.json();
};

