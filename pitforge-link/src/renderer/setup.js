function showProgress(message) {
  const el = document.getElementById("progress");
  if (!el) return;
  el.style.display = "block";
  el.textContent = message;
}

async function init() {
  window.pitforge.onPluginInstallProgress(showProgress);

  const config = await window.pitforge.getConfig();
  let lmuPath = config.lmuPath || "";
  if (!lmuPath) {
    const guessed = await window.pitforge.guessLmuPath();
    if (guessed) lmuPath = guessed;
  }
  document.getElementById("lmuPath").value = lmuPath;
  document.getElementById("serverUrl").value = config.serverUrl || "http://localhost:3009";
  document.getElementById("demoMode").checked = !!config.demoMode;
}

function showMessage(text, type = "info") {
  const el = document.getElementById("message");
  el.className = `message message-${type}`;
  el.textContent = text;
}

function showPluginLog(steps, errors) {
  const el = document.getElementById("pluginLog");
  el.style.display = "block";
  el.innerHTML = [
    ...steps.map((s) => `<div>✓ ${s}</div>`),
    ...errors.map((e) => `<div style="color:#fca5a5">✗ ${e}</div>`),
  ].join("");
}

document.getElementById("browseBtn").addEventListener("click", async () => {
  const path = await window.pitforge.browseLmuPath();
  if (path) document.getElementById("lmuPath").value = path;
});

document.getElementById("installBtn").addEventListener("click", async () => {
  const btn = document.getElementById("installBtn");
  btn.disabled = true;
  btn.textContent = "Installing…";

  const result = await window.pitforge.saveSetup({
    lmuPath: document.getElementById("lmuPath").value.trim(),
    serverUrl: document.getElementById("serverUrl").value.trim(),
    demoMode: document.getElementById("demoMode").checked,
  });

  if (!result.ok) {
    showMessage(result.error, "error");
    btn.disabled = false;
    btn.textContent = "Install plugin & finish setup";
    return;
  }

  showPluginLog(result.pluginResult.steps, result.pluginResult.errors);

  if (result.pluginResult.ok) {
    showMessage("Setup complete! Enable Plugins in LMU gameplay settings, then restart the game.", "success");
    btn.textContent = "Open PitForge Link";
    btn.disabled = false;
    btn.onclick = () => window.pitforge.setupFinished();
  } else {
    showMessage("Setup saved with warnings — check plugin steps below. You may need to copy the DLL manually.", "error");
    btn.disabled = false;
    btn.textContent = "Continue anyway";
    btn.onclick = () => window.pitforge.setupFinished();
  }
});

init();
