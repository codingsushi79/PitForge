import Link from "next/link";
import { Nav, FeatureIcon } from "@/components/nav";
import { brand } from "@/lib/brand";
import {
  Check,
  Radio,
  Users,
  Flag,
  Upload,
  Map,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_50%)] opacity-15" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
            Free for teams · No subscriptions
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            PLAN.<span className="text-gradient">PIT</span>.WIN.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted">
            {brand.description} Build lineups, plan stints, share setups, and stream live
            telemetry to your pit wall — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              Get started free
            </Link>
            <Link href="/dashboard" className="btn-secondary text-base px-8 py-3">
              Open dashboard
            </Link>
          </div>
          <div className="mt-16 flex justify-center gap-8 text-sm text-muted">
            <span className="flex items-center gap-2"><Flag className="h-4 w-4 text-accent" /> Strategy</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Lineups</span>
            <span className="flex items-center gap-2"><Radio className="h-4 w-4 text-accent" /> Telemetry</span>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">What is {brand.name}?</p>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            The pit wall for endurance sim racing.
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            {brand.name} helps drivers and endurance teams prepare smarter before the race,
            stay organized during the event, and make better calls while the session is live.
            Strategy, setups, team coordination, and live telemetry — one platform.
          </p>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-surface/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            <FeatureBlock
              icon="strategy"
              step="01"
              title="Plan"
              subtitle="Strategy and stint planning"
              description="Build the full race plan before the green flag: stints, drivers, fuel, tyres, pit loss, start time, predicted finish, and timeline."
            />
            <FeatureBlock
              icon="teams"
              step="02"
              title="Organize"
              subtitle="Teams and lineups"
              description="Create team workspaces, class-specific lineups, and driver groups. Keep every race plan tied to the right crew."
            />
            <FeatureBlock
              icon="telemetry"
              step="03"
              title="Stream"
              subtitle="Live telemetry"
              description={`Run ${brand.bridgeName} on the driver PC to stream live Le Mans Ultimate data to teammates and race engineers.`}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">Teams & lineups</p>
          <h2 className="mb-12 text-3xl font-bold">Organize drivers like a race department.</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <DetailCard num="01" title="Team dashboard" text="A shared workspace for every driver and engineer on your roster." />
            <DetailCard num="02" title="Lineups" text="Separate Hypercar, GT3, or event-specific groups without mixing plans." />
            <DetailCard num="03" title="Team races" text="Attach race plans to the right lineup so strategy starts with the correct drivers." />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">Race strategy</p>
          <h2 className="mb-6 text-3xl font-bold">Build the race before it starts.</h2>
          <p className="mb-12 max-w-2xl text-muted">
            Model stint order, fuel and virtual energy, tyre allocation, pit loss,
            predicted finish time, and driver workload in one workflow.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["Stint planning", "Fuel calculator", "Tyre allocation", "Pit loss modeling", "Race timeline", "Driver workload", "VE tracking", "Setup sharing"].map((f) => (
              <div key={f} className="card !p-4 flex items-center gap-3">
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="telemetry" className="border-t border-border py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">Live telemetry</p>
          <h2 className="mb-12 text-3xl font-bold">Race-day data for the whole team.</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <TelemetryFeature icon={<Map className="h-5 w-5" />} title="Live track maps" text="Circuit maps with real-time car positions across all 14 LMU tracks." />
              <TelemetryFeature icon={<Radio className="h-5 w-5" />} title="Pit wall view" text="Engineer-style timing, traffic, pit windows, fuel, tyres, and weather." />
              <TelemetryFeature icon={<Shield className="h-5 w-5" />} title="Smart warnings" text="Alerts for low fuel, tyre wear, pit traffic, rain, and engine temps." />
              <TelemetryFeature icon={<Users className="h-5 w-5" />} title="Shared visibility" text="Teammates follow the race with the same live context as the driver PC." />
              <TelemetryFeature icon={<Upload className="h-5 w-5" />} title="Setup library" text="Upload and share setup files with your team in one place." />
            </div>
            <div className="card glow-accent">
              <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">Data flow</div>
              <div className="space-y-4 text-sm">
                <div className="rounded-lg bg-surface-2 p-4">
                  <div className="font-medium text-accent">Le Mans Ultimate</div>
                  <div className="text-muted">Live session on track</div>
                </div>
                <div className="text-center text-muted">↓</div>
                <div className="rounded-lg bg-surface-2 p-4">
                  <div className="font-medium">{brand.bridgeName}</div>
                  <div className="text-muted">Desktop companion (Windows)</div>
                </div>
                <div className="text-center text-muted">↓</div>
                <div className="rounded-lg bg-surface-2 p-4">
                  <div className="font-medium">{brand.name} pit wall</div>
                  <div className="text-muted">Track map, standings, warnings, weather</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-surface/50 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-accent">Pricing</p>
          <h2 className="mb-4 text-3xl font-bold">Everything included. Always free.</h2>
          <p className="mx-auto mb-12 max-w-xl text-muted">
            No tiers, no paywalls. Every feature is available to every team from day one.
          </p>
          <div className="mx-auto max-w-md card glow-accent text-left">
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">Full access</div>
            <div className="mb-4 text-2xl font-bold">{brand.name}</div>
            <div className="mb-6 text-3xl font-bold text-accent">$0</div>
            <ul className="mb-8 space-y-3 text-sm">
              {[
                "Personal & team race plans",
                "Teams, lineups & driver management",
                "Full strategy planner with timeline",
                "Live telemetry & track maps",
                "PitForge Link desktop app",
                "Setup file sharing",
                "Pit wall view with warnings",
                "All 14 LMU tracks",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary w-full">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>© {new Date().getFullYear()} {brand.name} — {brand.tagline}</span>
          <span>Not affiliated with Studio 397</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureBlock({ icon, step, title, subtitle, description }: {
  icon: "strategy" | "teams" | "telemetry";
  step: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <FeatureIcon icon={icon} />
        <span className="font-mono text-xs text-muted">{step}</span>
      </div>
      <h3 className="mb-1 text-xl font-bold">{title}</h3>
      <p className="mb-3 text-sm font-medium text-accent">{subtitle}</p>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

function DetailCard({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="card">
      <span className="font-mono text-xs text-accent">{num}</span>
      <h3 className="mt-2 mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

function TelemetryFeature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}
