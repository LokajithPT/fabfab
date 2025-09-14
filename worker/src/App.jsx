import { useState } from "react";
import ScanOrder from "./components/ScanOrder";

export default function App() {
  const [workerName, setWorkerName] = useState("");
  const [workerEmail, setWorkerEmail] = useState("");
  const [location, setLocation] = useState("Warehouse"); // default location

  const handleWorkerInfoSubmit = (e) => {
    e.preventDefault();
    if (!workerName || !workerEmail) {
      alert("Enter your name and email!");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Worker Order Tracking</h1>

      {/* Worker info form */}
      <form
        onSubmit={handleWorkerInfoSubmit}
        className="w-full max-w-md bg-white p-4 rounded shadow mb-4"
      >
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Name</label>
          <input
            type="text"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Worker Name"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={workerEmail}
            onChange={(e) => setWorkerEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Worker Email"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-semibold">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Warehouse</option>
            <option>Pickup</option>
            <option>Delivery</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded mt-2"
        >
          Start Scanning
        </button>
      </form>

      {/* Scan QR Component */}
      {workerName && workerEmail && (
        <ScanOrder
          worker={{ name: workerName, email: workerEmail }}
          location={location}
        />
      )}
    </div>
  );
}

