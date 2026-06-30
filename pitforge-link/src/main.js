const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { getConfig, setConfig, isSetupComplete } = require("./lib/config");
const { installPlugin, validateLmuPath } = require("./lib/plugin-installer");
const { TelemetryClient } = require("./lib/telemetry-client");
const { isLmuRunning } = require("./lib/telemetry-windows");

let mainWindow = null;
let setupWindow = null;
const telemetry = new TelemetryClient();

function createWindow(htmlFile, options = {}) {
  const win = new BrowserWindow({
    width: options.width || 480,
    height: options.height || 620,
    minWidth: 420,
    minHeight: 500,
    resizable: true,
    autoHideMenuBar: true,
    backgroundColor: "#0d0d12",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "..", "build", "icon.png"),
    title: options.title || "PitForge Link",
    ...options.windowOptions,
  });
  win.loadFile(path.join(__dirname, "renderer", htmlFile));
  return win;
}

function openMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }
  mainWindow = createWindow("index.html", { width: 440, height: 560, title: "PitForge Link" });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function openSetupWindow(finishToMain = true) {
  if (setupWindow) {
    setupWindow.focus();
    return;
  }
  setupWindow = createWindow("setup.html", { width: 560, height: 680, title: "PitForge Link Setup" });
  setupWindow.on("closed", () => {
    setupWindow = null;
    if (finishToMain && isSetupComplete()) openMainWindow();
  });
}

app.whenReady().then(() => {
  telemetry.onStatus((status) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("telemetry-status", status);
    }
  });

  if (isSetupComplete()) {
    openMainWindow();
  } else {
    openSetupWindow(false);
  }
});

app.on("window-all-closed", async () => {
  await telemetry.stop();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async () => {
  await telemetry.stop();
});

// --- IPC ---

ipcMain.handle("get-config", () => getConfig());

ipcMain.handle("save-setup", async (_e, data) => {
  const validation = validateLmuPath(data.lmuPath);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  setConfig({
    lmuPath: data.lmuPath,
  });

  const sendProgress = (message) => {
    if (setupWindow && !setupWindow.isDestroyed()) {
      setupWindow.webContents.send("plugin-install-progress", message);
    }
  };

  const pluginResult = await installPlugin(sendProgress);
  setConfig({
    pluginInstalled: pluginResult.ok,
    setupComplete: true,
  });

  return {
    ok: true,
    pluginResult,
    warning: validation.warning,
  };
});

ipcMain.handle("guess-lmu-path", () => {
  if (process.platform !== "win32") return null;
  const candidates = [
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate",
    "C:\\Program Files\\Steam\\steamapps\\common\\Le Mans Ultimate",
    "D:\\Steam\\steamapps\\common\\Le Mans Ultimate",
    "E:\\SteamLibrary\\steamapps\\common\\Le Mans Ultimate",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
});

ipcMain.handle("browse-lmu-path", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select Le Mans Ultimate folder",
    properties: ["openDirectory"],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle("run-plugin-install", async () => {
  const win = BrowserWindow.getFocusedWindow();
  const sendProgress = (message) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("plugin-install-progress", message);
    }
  };
  return installPlugin(sendProgress);
});

ipcMain.handle("open-settings", () => {
  openSetupWindow(true);
});

ipcMain.handle("open-external", (_e, url) => shell.openExternal(url));

ipcMain.handle("connect", async (_e, shareCode) => {
  if (!shareCode || shareCode.length < 4) {
    return { ok: false, error: "Enter a valid session key" };
  }
  try {
    await telemetry.start(shareCode.trim().toUpperCase());
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("disconnect", async () => {
  await telemetry.stop();
  return { ok: true };
});

ipcMain.handle("get-telemetry-status", () => ({
  ...telemetry.getStatus(),
  gameRunning: isLmuRunning(),
}));

ipcMain.handle("setup-finished", () => {
  if (setupWindow) setupWindow.close();
  openMainWindow();
});
