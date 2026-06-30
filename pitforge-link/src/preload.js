const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pitforge", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveSetup: (data) => ipcRenderer.invoke("save-setup", data),
  browseLmuPath: () => ipcRenderer.invoke("browse-lmu-path"),
  guessLmuPath: () => ipcRenderer.invoke("guess-lmu-path"),
  runPluginInstall: () => ipcRenderer.invoke("run-plugin-install"),
  openSettings: () => ipcRenderer.invoke("open-settings"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  connect: (code) => ipcRenderer.invoke("connect", code),
  disconnect: () => ipcRenderer.invoke("disconnect"),
  getTelemetryStatus: () => ipcRenderer.invoke("get-telemetry-status"),
  setupFinished: () => ipcRenderer.invoke("setup-finished"),
  onTelemetryStatus: (cb) => {
    const handler = (_e, status) => cb(status);
    ipcRenderer.on("telemetry-status", handler);
    return () => ipcRenderer.removeListener("telemetry-status", handler);
  },
  onPluginInstallProgress: (cb) => {
    const handler = (_e, message) => cb(message);
    ipcRenderer.on("plugin-install-progress", handler);
    return () => ipcRenderer.removeListener("plugin-install-progress", handler);
  },
});
