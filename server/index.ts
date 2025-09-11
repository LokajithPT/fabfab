import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5173;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------
// SERVE FRONTEND
// ----------------------------
const clientPath = path.resolve(__dirname, "../client");

// Serve static files (JS, CSS, assets)
app.use(express.static(clientPath));

// All other routes send index.html (React Router support)
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(clientPath, "index.html"));
});

// ----------------------------
// START SERVER
// ----------------------------
app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});

