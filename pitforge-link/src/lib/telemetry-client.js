const { getConfig, setConfig } = require("./config");
const { readTelemetry } = require("./telemetry-windows");

function lockTeamTracking(data) {
  const config = getConfig();
  let trackedCarNumber = config.trackedCarNumber;
  let trackedTeamName = config.trackedTeamName || "";

  if (!trackedCarNumber && !trackedTeamName) {
    const player = data.vehicles.find((v) => v.id === data.playerVehicleId);
    if (player) {
      trackedCarNumber = player.carNumber ?? null;
      trackedTeamName = player.teamName ?? "";
      setConfig({ trackedCarNumber, trackedTeamName });
    }
  }

  let playerVehicleId = data.playerVehicleId;
  if (trackedCarNumber != null) {
    const match = data.vehicles.find((v) => v.carNumber === trackedCarNumber);
    if (match) playerVehicleId = match.id;
  } else if (trackedTeamName) {
    const team = trackedTeamName.toLowerCase().trim();
    const match = data.vehicles.find(
      (v) => (v.teamName || "").toLowerCase().trim() === team
    );
    if (match) playerVehicleId = match.id;
  }

  return {
    ...data,
    trackedCarNumber: trackedCarNumber ?? undefined,
    trackedTeamName: trackedTeamName || undefined,
    playerVehicleId,
  };
}

class TelemetryClient {
  constructor() {
    this.sessionId = null;
    this.shareCode = null;
    this.trackId = "spa";
    this.interval = null;
    this.tick = 0;
    this.listeners = new Set();
    this.lastError = null;
    this.lastSource = null;
  }

  onStatus(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(status) {
    for (const fn of this.listeners) fn(status);
  }

  async resolveShareCode(code) {
    const { serverUrl } = getConfig();
    const url = `${serverUrl.replace(/\/$/, "")}/api/telemetry?code=${encodeURIComponent(code.toUpperCase())}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Session not found (${res.status})`);
    }
    const data = await res.json();
    this.sessionId = data.sessionId;
    this.shareCode = code.toUpperCase();
    this.trackId = data.trackId || "spa";
    return data;
  }

  async send(data) {
    const { serverUrl } = getConfig();
    const url = `${serverUrl.replace(/\/$/, "")}/api/telemetry/${this.sessionId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  }

  async start(shareCode) {
    await this.stop();
    setConfig({ trackedCarNumber: null, trackedTeamName: "" });
    await this.resolveShareCode(shareCode);

    this.tick = 0;
    this.emit({ state: "connecting", shareCode: this.shareCode });

    const tick = async () => {
      try {
        const { demoMode } = getConfig();
        const result = readTelemetry(this.trackId, demoMode);

        if (result.source === "waiting") {
          this.emit({
            state: "waiting-game",
            shareCode: this.shareCode,
            tick: this.tick,
            message: "Start Le Mans Ultimate and enter a session",
          });
          return;
        }

        if (result.data) {
          const payload = lockTeamTracking(result.data);
          await this.send(payload);
          this.tick++;
          this.lastSource = result.source;
          this.lastError = null;
          this.emit({
            state: "streaming",
            shareCode: this.shareCode,
            tick: this.tick,
            source: result.source,
            gameRunning: result.gameRunning,
          });
        }
      } catch (e) {
        this.lastError = e.message;
        this.emit({
          state: "error",
          shareCode: this.shareCode,
          error: e.message,
          tick: this.tick,
        });
      }
    };

    await tick();
    this.interval = setInterval(tick, 1000);
    this.emit({ state: "connected", shareCode: this.shareCode, sessionId: this.sessionId });
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.sessionId = null;
    this.shareCode = null;
    this.tick = 0;
    this.emit({ state: "idle" });
  }

  getStatus() {
    return {
      sessionId: this.sessionId,
      shareCode: this.shareCode,
      tick: this.tick,
      lastSource: this.lastSource,
      lastError: this.lastError,
    };
  }
}

module.exports = { TelemetryClient };
