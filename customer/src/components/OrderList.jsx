import { useEffect, useState } from "react";
import { getOrdersByEmail, deleteOrderById } from "../api/api"; // new helper functions
import OrderForm from "./OrderForm";

export default function OrderList({ customerEmail }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      // fetch orders using customerEmail instead of JWT
      const res = await getOrdersByEmail(customerEmail);
	    console.log("Fetched orders:", res);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      setError(err.error || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerEmail) fetchOrders();
  }, [customerEmail]);

const handleDelete = async (id) => {
  try {
    await deleteOrderById(id, customerEmail); // ✅ pass email
    fetchOrders();
  } catch (err) {
    console.error("Delete order failed:", err);
    setError(err.error || "Failed to delete order");
  }
};

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Orders for {customerEmail}</h1>

      <OrderForm customerEmail={customerEmail} onOrderCreated={fetchOrders} />

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && orders.length === 0 && !error && <p>No orders yet</p>}

      <div className="mt-4 space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{order.service || "Unknown Service"}</p>
              <p>Total: ₹{order.total || "N/A"}</p>
              <p>Pickup: {order.pickupDate || "N/A"}</p>
            </div>
            <button
              onClick={() => handleDelete(order.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

