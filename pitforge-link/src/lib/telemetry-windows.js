const { execSync } = require("child_process");
const { createMockTelemetry } = require("./telemetry-mock");

let lastGameRunning = false;

function isLmuRunning() {
  if (process.platform !== "win32") return false;
  try {
    const out = execSync(
      'tasklist /FI "IMAGENAME eq Le Mans Ultimate.exe" /NH',
      { encoding: "utf8", windowsHide: true }
    );
    return out.toLowerCase().includes("le mans ultimate.exe");
  } catch {
    return false;
  }
}

function isSharedMemoryAvailable() {
  if (process.platform !== "win32") return false;
  try {
    const { openSync, readSync, closeSync } = require("fs");
    // rF2 shared memory map — probe for telemetry buffer
    const fd = openSync("\\\\.\\pipe\\rF2SMMP_Telemetry", "r");
    closeSync(fd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read live telemetry from LMU shared memory.
 * Falls back to structured mock when game/plugin not detected.
 */
function readTelemetry(trackId = "spa", demoMode = false) {
  if (demoMode) {
    return { data: createMockTelemetry(trackId), source: "demo" };
  }

  const gameRunning = isLmuRunning();
  lastGameRunning = gameRunning;

  if (!gameRunning) {
    return { data: null, source: "waiting", gameRunning: false };
  }

  try {
    const native = require("./telemetry-native");
    const data = native.read();
    if (data) {
      return { data, source: "live", gameRunning: true };
    }
  } catch {
    /* native reader not available */
  }

  // Game running but full native parser not loaded — stream placeholder with game flag
  const mock = createMockTelemetry(trackId);
  return { data: mock, source: "game-detected", gameRunning: true };
}

function getGameStatus() {
  return { gameRunning: lastGameRunning || isLmuRunning() };
}

module.exports = { readTelemetry, isLmuRunning, getGameStatus };
