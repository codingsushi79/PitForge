/**
 * PitForge Link
 *
 * Streams Le Mans Ultimate telemetry to the PitForge pit wall.
 *
 * Usage:
 *   BRIDGE_SESSION_ID=<session-id> BRIDGE_SERVER_URL=http://localhost:3009 npm run bridge
 *   BRIDGE_DEMO=1 BRIDGE_SESSION_ID=<session-id> npm run bridge
 */

const SESSION_ID = process.env.BRIDGE_SESSION_ID;
const SERVER_URL = process.env.BRIDGE_SERVER_URL || "http://localhost:3000";
const DEMO_MODE = process.env.BRIDGE_DEMO === "1";
const INTERVAL_MS = 1000;

if (!SESSION_ID) {
  console.error("Error: Set BRIDGE_SESSION_ID to your telemetry session ID");
  console.error("Start a session in Dashboard → Telemetry, then copy the session ID");
  process.exit(1);
}

function createMockTelemetry() {
  const vehicles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    position: i + 1,
    driverName: `Driver ${i + 1}`,
    teamName: `Team ${String.fromCharCode(65 + (i % 5))}`,
    carClass: i < 4 ? "Hypercar" : "LMGT3",
    lap: 15 + Math.floor(Math.random() * 3),
    lapTime: 105 + Math.random() * 8,
    bestLap: 103 + Math.random() * 3,
    gap: i === 0 ? 0 : 1 + i * 2.5,
    gapLeader: i === 0 ? 0 : 1 + i * 2.5,
    fuel: 30 + Math.random() * 50,
    fuelCapacity: 90,
    tyres: {
      fl: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24, compound: "Medium" },
      fr: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24, compound: "Medium" },
      rl: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23, compound: "Medium" },
      rr: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23, compound: "Medium" },
    },
    trackProgress: Math.random(),
    inPits: false,
    pitCount: Math.floor(Math.random() * 3),
    sector1: 28 + Math.random() * 3,
    sector2: 35 + Math.random() * 4,
    sector3: 40 + Math.random() * 4,
    engineTemp: 95 + Math.random() * 15,
    waterTemp: 85 + Math.random() * 10,
    damage: Math.random() * 5,
  }));

  return {
    sessionType: "Race",
    sessionTime: 3600 + Math.random() * 1800,
    sessionRemaining: 3600,
    trackName: "spa",
    trackId: "spa",
    flag: "green",
    vehicles,
    playerVehicleId: 3,
    weather: {
      ambientTemp: 22,
      trackTemp: 38,
      rain: 0,
      forecast: "dry",
      windSpeed: 8,
    },
    warnings: [],
  };
}

async function sendTelemetry(data) {
  try {
    const res = await fetch(`${SERVER_URL}/api/telemetry/${SESSION_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error(`Failed to send telemetry: ${res.status}`);
    }
  } catch (err) {
    console.error("Connection error:", err.message);
  }
}

async function readLMUTelemetry() {
  if (process.platform !== "win32") {
    return createMockTelemetry();
  }

  try {
    const reader = require("./rf2-reader");
    return reader.read();
  } catch {
    return createMockTelemetry();
  }
}

console.log("PitForge Link");
console.log(`  Server:  ${SERVER_URL}`);
console.log(`  Session: ${SESSION_ID}`);
console.log(`  Mode:    ${DEMO_MODE ? "Demo" : process.platform === "win32" ? "LMU Shared Memory" : "Demo (non-Windows)"}`);
console.log("");

let tick = 0;
setInterval(async () => {
  tick++;
  const data = DEMO_MODE ? createMockTelemetry() : await readLMUTelemetry();
  await sendTelemetry(data);
  if (tick % 10 === 0) {
    console.log(`[${new Date().toLocaleTimeString()}] Sent telemetry tick #${tick}`);
  }
}, INTERVAL_MS);

console.log("Streaming telemetry... Press Ctrl+C to stop.");
