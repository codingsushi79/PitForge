# PitForge Link

Windows desktop app + NSIS installer for streaming Le Mans Ultimate telemetry to PitForge.

## User flow

1. Run **PitForgeLink-Setup-x.x.x.exe**
2. Choose install location → finish installer
3. Open **PitForge Link** from desktop/start menu
4. **Setup wizard** (first launch):
   - Browse to Le Mans Ultimate folder
   - Click **Install plugin & finish setup** — downloads the IronWolf plugin from GitHub, installs the DLL, and updates `CustomPluginVariables.JSON`
5. In PitForge web app: **Telemetry → Start session** → copy **share code**
6. Launch LMU, join a session
7. In PitForge Link: enter share code → **Connect**

## Build the Windows installer

Requires **Windows** (or GitHub Actions — see `.github/workflows/build-pitforge-link.yml`).

```bash
cd pitforge-link
npm install

# Optional: bundle the plugin DLL for offline installs
# Setup wizard auto-downloads from TheIronWolf GitHub if not bundled:
#   rFactor2SharedMemoryMapPlugin64.dll → resources/

npm run dist:win
```

Output: `pitforge-link/dist/PitForgeLink-Setup-1.0.0.exe`

Copy to web app for download:

```bash
cp dist/PitForgeLink-Setup-*.exe ../public/downloads/PitForgeLink-Setup.exe
```

## Dev mode (any OS)

```bash
npm start
```

On Linux/macOS, demo mode works; LMU shared memory requires Windows.

## Bundled plugin DLL

TheIronWolf permits free redistribution with README included. Place the DLL at:

```
pitforge-link/resources/rFactor2SharedMemoryMapPlugin64.dll
```

If missing, the setup wizard downloads the plugin automatically on first run.
