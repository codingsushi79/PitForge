let connected = false;

const shareInput = document.getElementById("shareCode");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusText = document.getElementById("statusText");
const gameText = document.getElementById("gameText");
const tickText = document.getElementById("tickText");
const sourceText = document.getElementById("sourceText");
const messageEl = document.getElementById("message");

function setStatus(text, dotClass = "gray") {
  statusText.innerHTML = `<span class="dot dot-${dotClass}"></span>${text}`;
}

function showMessage(text, type = "info") {
  messageEl.className = `message message-${type}`;
  messageEl.textContent = text;
  messageEl.style.display = text ? "block" : "none";
}

function setConnected(val) {
  connected = val;
  connectBtn.style.display = val ? "none" : "block";
  disconnectBtn.style.display = val ? "block" : "none";
  shareInput.disabled = val;
}

function formatSource(source) {
  const map = {
    live: "Live",
    "game-detected": "Game running",
    demo: "Practice",
    waiting: "Waiting for game",
  };
  return map[source] || source || "—";
}

window.pitforge.onTelemetryStatus((status) => {
  switch (status.state) {
    case "connecting":
      setStatus("Connecting…", "orange");
      showMessage("");
      break;
    case "connected":
      setConnected(true);
      setStatus("Connected", "green");
      break;
    case "waiting-game":
      setStatus("Waiting for LMU", "orange");
      showMessage("Launch Le Mans Ultimate and join a session, then telemetry will stream automatically.", "info");
      tickText.textContent = String(status.tick || 0);
      gameText.textContent = "Not running";
      break;
    case "streaming":
      setStatus("Streaming", "green");
      showMessage("");
      tickText.textContent = String(status.tick || 0);
      gameText.textContent = status.gameRunning ? "Running" : "Unknown";
      sourceText.textContent = formatSource(status.source);
      break;
    case "error":
      setStatus("Error", "red");
      showMessage(status.error || "Connection failed", "error");
      break;
    case "idle":
      setConnected(false);
      setStatus("Idle", "gray");
      tickText.textContent = "0";
      gameText.textContent = "—";
      sourceText.textContent = "—";
      showMessage("");
      break;
  }
});

connectBtn.addEventListener("click", async () => {
  const code = shareInput.value.trim().toUpperCase();
  if (!code) {
    showMessage("Enter the session key from PitForge Telemetry", "error");
    return;
  }

  connectBtn.disabled = true;
  setStatus("Connecting…", "orange");

  const result = await window.pitforge.connect(code);
  connectBtn.disabled = false;

  if (!result.ok) {
    setStatus("Failed", "red");
    showMessage(result.error, "error");
    return;
  }

  setConnected(true);
});

disconnectBtn.addEventListener("click", async () => {
  await window.pitforge.disconnect();
  setConnected(false);
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  window.pitforge.openSettings();
});

document.getElementById("helpBtn").addEventListener("click", () => {
  window.pitforge.openExternal("https://pitforge.sushii.dev/dashboard/bridge");
});

shareInput.addEventListener("input", () => {
  shareInput.value = shareInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

// Poll game status while idle
setInterval(async () => {
  if (connected) return;
  const s = await window.pitforge.getTelemetryStatus();
  gameText.textContent = s.gameRunning ? "Running" : "Not running";
}, 3000);

(async () => {
  const s = await window.pitforge.getTelemetryStatus();
  gameText.textContent = s.gameRunning ? "Running" : "Not running";
})();
