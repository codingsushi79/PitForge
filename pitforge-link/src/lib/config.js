const Store = require("electron-store");

const store = new Store({
  name: "pitforge-link-config",
  defaults: {
    setupComplete: false,
    lmuPath: "",
    serverUrl: "http://localhost:3009",
    pluginInstalled: false,
    demoMode: false,
    trackedCarNumber: null,
    trackedTeamName: "",
  },
});

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

module.exports = { store, getConfig, setConfig, isSetupComplete, getLmuPluginsDir, getLmuPlayerDataDir };
