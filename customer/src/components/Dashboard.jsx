import { useEffect, useState } from "react";
import OrderList from "./OrderList";

export default function Dashboard({ onLogout }) {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.email) {
        setEmail(user.email);
      } else {
        console.warn("No email found in user object:", user);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }
  }, []);

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">No user email found. Please log in again.</p>
        <button
          onClick={onLogout}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <OrderList customerEmail={email} />
      <div className="p-4">
        <button
          onClick={onLogout}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

