import { useState } from "react";
import { QrReader } from "react-qr-reader"; // legacy peer deps version
import { registerScan } from "../api/api"; // backend helper

export default function ScanOrder({ worker, location }) {
  const [scanResult, setScanResult] = useState("");
  const [status, setStatus] = useState("");

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data.text || data);
      setStatus("Sending to server...");
      try {
        await registerScan({
          workerName: worker.name,
          workerEmail: worker.email,
          location,
          orderData: data.text || data,
        });
        setStatus("Scan registered successfully!");
      } catch (err) {
        console.error(err);
        setStatus("Failed to register scan");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Scan QR Code</h2>
      <QrReader
        onResult={(result, error) => {
          if (!!result) handleScan(result);
          if (!!error) console.error(error);
        }}
        constraints={{ facingMode: "environment" }}
        style={{ width: "100%" }}
      />
      {scanResult && (
        <div className="mt-2 p-2 bg-gray-200 rounded">
          <p><strong>Scanned:</strong> {scanResult}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Location:</strong> {location}</p>
        </div>
      )}
    </div>
  );
}

