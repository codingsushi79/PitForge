import Link from "next/link";
import { brand } from "@/lib/brand";
import { Download, Monitor, Wifi, CheckCircle2 } from "lucide-react";

const DOWNLOAD_URL = "/downloads/PitForgeLink-Setup.exe";

export default function BridgePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">{brand.bridgeName}</h1>
      <p className="mb-8 text-muted">
        Install the Windows companion app on your gaming PC to stream live Le Mans Ultimate
        telemetry to your team&apos;s pit wall.
      </p>

      <div className="space-y-6">
        <div className="card glow-accent border-accent/30">
          <div className="mb-4 flex items-center gap-3">
            <Download className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-semibold">Download for Windows</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            The installer sets up {brand.bridgeName} on your PC and walks you through connecting
            to Le Mans Ultimate in a few minutes.
          </p>
          <a href={DOWNLOAD_URL} download className="btn-primary inline-flex">
            <Download className="h-4 w-4" />
            Download {brand.bridgeName}
          </a>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Getting started</h2>
          <Step num={1} title="Install and set up">
            Run the installer, then open <strong>{brand.bridgeName}</strong> from your desktop.
            The setup wizard will locate your Le Mans Ultimate folder and configure telemetry
            automatically.
          </Step>
          <Step num={2} title="Enable plugins in the game">
            In Le Mans Ultimate, open Settings → Gameplay and turn <strong>Enable Plugins</strong> on.
            Restart the game once.
          </Step>
          <Step num={3} title="Start a live session">
            In PitForge, go to Dashboard → Telemetry and click <strong>Start session</strong>.
            Copy your <strong>session key</strong> — you&apos;ll need it in the next step.
          </Step>
          <Step num={4} title="Connect from your gaming PC">
            Launch Le Mans Ultimate and join a session. Open {brand.bridgeName}, enter your session
            key, and click <strong>Connect</strong>. Your pit wall updates in real time.
          </Step>
          <Step num={5} title="Share with your team">
            Teammates can follow along from{" "}
            <Link href="/dashboard/telemetry" className="text-accent hover:underline">
              Live telemetry
            </Link>{" "}
            or the public pit wall link — no install required for viewers.
          </Step>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-3">
            <Monitor className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-semibold">What the app configures</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              "Le Mans Ultimate install path",
              "Telemetry plugin for live data",
              "In-game plugin settings",
              "Desktop shortcut for quick access",
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
            <h2 className="text-lg font-semibold">Live on your pit wall</h2>
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
              "Smart warnings",
              "Pit stop count",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-muted">
                <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
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
