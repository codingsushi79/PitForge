const fs = require("fs");
const path = require("path");
const { getLmuPluginsDir, getLmuPlayerDataDir } = require("./config");
const { ensurePluginDll, PLUGIN_DLL } = require("./plugin-downloader");

const PLUGIN_KEY = "rFactor2SharedMemoryMapPlugin64.dll";

const DEFAULT_PLUGIN_CONFIG = {
  " Enabled": 1,
  DebugISIInternals: 0,
  DebugOutputLevel: 0,
  DebugOutputSource: 0,
  DedicatedServerMapGlobally: 0,
  EnableDirectMemoryAccess: 0,
  EnableHWControlInput: 0,
  EnableRulesControlInput: 0,
  EnableWeatherControlInput: 0,
  UnsubscribedBuffersMask: 0,
};

function getBundledPluginPath() {
  const { app } = require("electron");
  const bases = [
    path.join(process.resourcesPath, "resources", PLUGIN_DLL),
    path.join(app.getAppPath(), "resources", PLUGIN_DLL),
    path.join(__dirname, "..", "..", "resources", PLUGIN_DLL),
  ];
  for (const p of bases) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function installPlugin(onProgress) {
  const pluginsDir = getLmuPluginsDir();
  const playerDir = getLmuPlayerDataDir();
  const errors = [];
  const steps = [];

  if (!pluginsDir || !playerDir) {
    return { ok: false, errors: ["Le Mans Ultimate path is not configured."], steps };
  }

  if (!fs.existsSync(pluginsDir)) {
    try {
      fs.mkdirSync(pluginsDir, { recursive: true });
      steps.push("Created Plugins folder");
    } catch (e) {
      errors.push(`Could not create Plugins folder: ${e.message}`);
    }
  }

  const destDll = path.join(pluginsDir, PLUGIN_DLL);
  const bundled = getBundledPluginPath();

  if (bundled) {
    try {
      fs.copyFileSync(bundled, destDll);
      steps.push("Installed telemetry plugin");
    } catch (e) {
      errors.push(`Could not install telemetry plugin: ${e.message}`);
    }
  } else {
    try {
      const sourceDll = await ensurePluginDll(onProgress);
      fs.copyFileSync(sourceDll, destDll);
      steps.push("Installed telemetry plugin");
    } catch (e) {
      if (fs.existsSync(destDll)) {
        steps.push("Telemetry plugin already installed");
      } else {
        errors.push(`Could not install telemetry plugin: ${e.message}`);
      }
    }
  }

  const configPath = path.join(playerDir, "CustomPluginVariables.JSON");
  try {
    if (!fs.existsSync(playerDir)) {
      fs.mkdirSync(playerDir, { recursive: true });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf8");
      config = JSON.parse(raw);
    }

    config[PLUGIN_KEY] = { ...(config[PLUGIN_KEY] || {}), ...DEFAULT_PLUGIN_CONFIG };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    steps.push("Enabled telemetry in game settings");
  } catch (e) {
    errors.push(`Could not update game settings: ${e.message}`);
  }

  const readmeSrc = bundled
    ? path.join(path.dirname(bundled), "PLUGIN_README.txt")
    : path.join(__dirname, "..", "..", "resources", "PLUGIN_README.txt");
  if (fs.existsSync(readmeSrc)) {
    try {
      fs.copyFileSync(readmeSrc, path.join(pluginsDir, "rF2SharedMemoryMapPlugin-README.txt"));
    } catch {
      /* optional */
    }
  }

  return { ok: errors.length === 0, errors, steps };
}

function validateLmuPath(lmuPath) {
  if (!lmuPath || !fs.existsSync(lmuPath)) {
    return { valid: false, error: "Folder does not exist" };
  }
  const exe = path.join(lmuPath, "Le Mans Ultimate.exe");
  const alt = path.join(lmuPath, "Bin64", "Le Mans Ultimate.exe");
  if (fs.existsSync(exe) || fs.existsSync(alt)) {
    return { valid: true };
  }
  if (fs.existsSync(path.join(lmuPath, "Plugins")) || fs.existsSync(path.join(lmuPath, "UserData"))) {
    return { valid: true, warning: "Game executable not found, but folder looks like LMU install" };
  }
  return { valid: false, error: "Could not find Le Mans Ultimate.exe in this folder" };
}

module.exports = { installPlugin, validateLmuPath, PLUGIN_DLL, getBundledPluginPath };
