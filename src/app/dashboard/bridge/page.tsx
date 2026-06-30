import Link from "next/link";
import { brand } from "@/lib/brand";
import { Download, Monitor, Wifi, Settings, CheckCircle2 } from "lucide-react";

const DOWNLOAD_URL = "/downloads/PitForgeLink-Setup.exe";

export default function BridgePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">{brand.bridgeName}</h1>
      <p className="mb-8 text-muted">
        Download the Windows installer — it configures LMU paths, installs the telemetry plugin,
        and connects with a share code when your session is running.
      </p>

      <div className="space-y-6">
        <div className="card glow-accent border-accent/30">
          <div className="mb-4 flex items-center gap-3">
            <Download className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-semibold">Download for Windows</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            PitForgeLink-Setup.exe installs {brand.bridgeName}, configures the rF2 shared memory
            plugin in your LMU folder, and adds a desktop shortcut.
          </p>
          <a href={DOWNLOAD_URL} download className="btn-primary inline-flex">
            <Download className="h-4 w-4" />
            Download PitForge Link installer
          </a>
          <p className="mt-3 text-xs text-muted">
            Not built yet? Run <code className="text-accent">cd pitforge-link && npm run dist:win</code> on Windows,
            or trigger the GitHub Actions workflow.
          </p>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">How to connect</h2>
          <Step num={1} title="Install PitForge Link">
            Run the installer, then open <strong>PitForge Link</strong> from your desktop.
            The setup wizard asks for your Le Mans Ultimate folder and PitForge server URL —
            it installs the plugin DLL and updates <code>CustomPluginVariables.JSON</code> for you.
          </Step>
          <Step num={2} title="Enable plugins in LMU">
            In Le Mans Ultimate: Settings → Gameplay → Enable Plugins → ON. Restart the game.
          </Step>
          <Step num={3} title="Start a telemetry session">
            In PitForge: Dashboard → Telemetry → <strong>Start session</strong>. Copy the{" "}
            <strong>share code</strong> (6 characters).
          </Step>
          <Step num={4} title="Launch the game & connect">
            Start Le Mans Ultimate and join a session. Open PitForge Link, paste your share code,
            and click <strong>Connect</strong>. Your pit wall updates live.
          </Step>
          <Step num={5} title="Share with teammates">
            Teammates watch at{" "}
            <Link href="/dashboard/telemetry" className="text-accent hover:underline">Dashboard → Telemetry</Link>{" "}
            or the public pit wall link — no install needed for viewers.
          </Step>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <Monitor className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-semibold">What the installer sets up</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              "Copies rFactor2SharedMemoryMapPlugin64.dll to LMU/Plugins/",
              "Enables plugin in CustomPluginVariables.JSON",
              "Saves your PitForge server URL",
              "Creates PitForge Link desktop shortcut",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-muted">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <Wifi className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-semibold">What gets streamed</h2>
          </div>
          <ul className="grid gap-2 text-sm md:grid-cols-2">
            {[
              "Live standings & gaps",
              "Track map with positions",
              "Fuel levels",
              "Tyre wear, temps & pressures",
              "Sector times",
              "Weather & track temp",
              "Session flags",
              "Engine & water temps",
              "Automatic warnings",
              "Pit stop count",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-muted">
                <Settings className="h-3 w-3 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-surface-2">
          <h3 className="mb-2 font-medium text-sm">CLI fallback (developers)</h3>
          <pre className="text-xs text-muted overflow-x-auto">{`cd pitforge-link && npm start
# or legacy: npm run bridge (from project root)`}</pre>
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-sm text-accent">
        {num}
      </span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <div className="mt-1 text-sm text-muted">{children}</div>
      </div>
    </div>
  );
}
