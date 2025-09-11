// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { dirname, resolve } from "path";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: "client", // set client folder as root
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),       // frontend source
      "@shared": resolve(__dirname, "shared"),    // shared folder
      "@assets": resolve(__dirname, "attached_assets"), // assets
    },
  },
  server: {
    port: 5173, // frontend dev server
    fs: {
      strict: true,
      deny: ["**/.*"], // hide dotfiles
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Flask backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "../dist", // production build output
    emptyOutDir: true, // clean previous builds
  },
});

