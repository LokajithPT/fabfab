import { app, BrowserWindow } from "electron";
import path from "path";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // frontend only, no node in renderer
    },
  });

  // Load /admin from the compiled dist folder
  const adminPath = path.join(__dirname, "dist", "index.html");
  mainWindow.loadFile(adminPath, { hash: "admin" });
}

app.whenReady().then(createWindow);

// Quit app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




