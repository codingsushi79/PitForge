const Store = require("electron-store");

const PITFORGE_SERVER_URL = "https://pitforge.sushii.dev";

const store = new Store({
  name: "pitforge-link-config",
  defaults: {
    setupComplete: false,
    lmuPath: "",
    pluginInstalled: false,
    demoMode: false,
    trackedCarNumber: null,
    trackedTeamName: "",
  },
});

function getServerUrl() {
  return PITFORGE_SERVER_URL;
}

function getConfig() {
  return store.store;
}

function setConfig(partial) {
  store.set(partial);
  return getConfig();
}

function isSetupComplete() {
  return store.get("setupComplete") === true && !!store.get("lmuPath");
}

function getLmuPluginsDir() {
  const lmu = store.get("lmuPath");
  return lmu ? require("path").join(lmu, "Plugins") : "";
}

function getLmuPlayerDataDir() {
  const lmu = store.get("lmuPath");
  return lmu ? require("path").join(lmu, "UserData", "player") : "";
}

module.exports = {
  store,
  getConfig,
  setConfig,
  getServerUrl,
  PITFORGE_SERVER_URL,
  isSetupComplete,
  getLmuPluginsDir,
  getLmuPlayerDataDir,
};
