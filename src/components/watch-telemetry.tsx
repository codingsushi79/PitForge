"use client";

import { useState, useEffect } from "react";
import { PitWall } from "@/components/pit-wall";
import { Logo } from "@/components/logo";
import type { TelemetrySession } from "@/lib/telemetry";
import { Radio } from "lucide-react";

export default function WatchTelemetry({ shareCode }: { shareCode: string }) {
  const [session, setSession] = useState<TelemetrySession | null>(null);
  const [trackId, setTrackId] = useState("spa");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/telemetry?code=${shareCode}`);
        if (!res.ok) {
          setError("Session not found or ended");
          return;
        }
        const data = await res.json();
        if (data.trackId) setTrackId(data.trackId);
        if (data.telemetry) setSession(data.telemetry);
      } catch {
        setError("Connection failed");
      }
    }
    poll();
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, [shareCode]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Logo href="/" size="sm" />
            <p className="text-sm text-muted">Live pit wall · Code {shareCode}</p>
          </div>
          {!session && !error && (
            <span className="flex items-center gap-2 text-sm text-muted">
              <Radio className="h-4 w-4 animate-pulse text-accent" /> Waiting for data...
            </span>
          )}
        </div>
        {error ? (
          <div className="card text-center py-16 text-muted">{error}</div>
        ) : session ? (
          <PitWall data={session} trackLayoutId="gp" />
        ) : (
          <div className="card text-center py-16 text-muted">
            <Radio className="mx-auto mb-4 h-12 w-12 animate-pulse opacity-30" />
            Waiting for driver to connect bridge app...
          </div>
        )}
      </div>
    </div>
  );
}
