import { useState, useEffect } from "react";
import { getServices, createOrderByEmail } from "../api/api";

export default function OrderForm({ customerEmail, onOrderCreated, onLogout }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "", // will set on mount
    customerPhone: "",
    serviceId: "",
    pickupDate: "",
    total: 0,
  });

  // set customerEmail automatically when component mounts
  useEffect(() => {
    if (customerEmail) {
      setForm((prev) => ({ ...prev, customerEmail }));
      console.log("customer email set in form:", customerEmail);
    }
  }, [customerEmail]);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((err) => console.error("Failed to fetch services:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createOrderByEmail(form);
      setForm({
        customerName: "",
        customerEmail: customerEmail,
        customerPhone: "",
        serviceId: "",
        pickupDate: "",
        total: 0,
      });
      onOrderCreated();
    } catch (err) {
      console.error("Create order failed:", err);
      alert(err.error || "Failed to create order");
    }
  };

  return (
    <div className="border p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Create Order</h2>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white p-1 px-3 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          className="border p-1 mb-1 w-full"
        />
        <input
          placeholder="Phone"
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          className="border p-1 mb-1 w-full"
        />
        <select
          value={form.serviceId}
          onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
          className="border p-1 mb-1 w-full"
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - ₹{s.price}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.pickupDate}
          onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
          className="border p-1 mb-1 w-full"
        />
        <input
          type="number"
          placeholder="Total"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })}
          className="border p-1 mb-1 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Create
        </button>
      </form>
    </div>
  );
}

