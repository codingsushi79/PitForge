"use client";

import { useState, useEffect, useCallback } from "react";
import { PitWall } from "@/components/pit-wall";
import { createMockTelemetry, type TelemetrySession } from "@/lib/telemetry";
import { Radio, Copy, Check, Play, Square } from "lucide-react";

export default function TelemetryPage() {
  const [session, setSession] = useState<TelemetrySession | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("spa");
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/telemetry/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setSession(data.telemetry);
          setBridgeConnected(true);
        }
      }
    } catch {
      /* bridge may be offline */
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || demoMode) return;
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, [sessionId, demoMode, fetchTelemetry]);

  useEffect(() => {
    if (!demoMode) return;
    setSession(createMockTelemetry(trackId));
    const interval = setInterval(() => setSession(createMockTelemetry(trackId)), 2000);
    return () => clearInterval(interval);
  }, [demoMode, trackId]);

  async function startSession() {
    const res = await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessionId(data.id);
      setShareCode(data.shareCode);
    }
  }

  async function endSession() {
    if (sessionId) {
      await fetch(`/api/telemetry/${sessionId}`, { method: "DELETE" });
    }
    setSessionId(null);
    setShareCode(null);
    setSession(null);
    setDemoMode(false);
    setBridgeConnected(false);
  }

  function copyCode() {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live telemetry</h1>
          <p className="text-muted">Pit wall view with track map, standings, and warnings</p>
        </div>
        <div className="flex items-center gap-3">
          {!sessionId && !demoMode && (
            <>
              <select value={trackId} onChange={(e) => setTrackId(e.target.value)} className="input !w-auto">
                <option value="spa">Spa</option>
                <option value="le-mans">Le Mans</option>
                <option value="monza">Monza</option>
                <option value="fuji">Fuji</option>
                <option value="bahrain">Bahrain</option>
                <option value="sebring">Sebring</option>
                <option value="portimao">Portimão</option>
                <option value="imola">Imola</option>
                <option value="cota">COTA</option>
                <option value="interlagos">Interlagos</option>
                <option value="lusail">Lusail</option>
                <option value="silverstone">Silverstone</option>
                <option value="paul-ricard">Paul Ricard</option>
                <option value="barcelona">Barcelona</option>
              </select>
              <button onClick={startSession} className="btn-primary text-sm">
                <Radio className="h-4 w-4" /> Start session
              </button>
              <button onClick={() => setDemoMode(true)} className="btn-secondary text-sm">
                <Play className="h-4 w-4" /> Demo mode
              </button>
            </>
          )}
          {(sessionId || demoMode) && (
            <button onClick={endSession} className="btn-secondary text-sm">
              <Square className="h-4 w-4" /> End session
            </button>
          )}
        </div>
      </div>

      {shareCode && (
        <div className="mb-6 card flex flex-wrap items-center gap-4 !p-4">
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Share code for teammates</span>
            <div className="font-mono text-2xl font-bold text-accent">{shareCode}</div>
          </div>
          <button onClick={copyCode} className="btn-secondary text-sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy code"}
          </button>
          <div className="text-sm text-muted">
            Session ID: <code className="text-accent">{sessionId}</code>
            {bridgeConnected && <span className="ml-2 text-accent">● PitForge Link connected</span>}
            {!bridgeConnected && !demoMode && <span className="ml-2 text-warning">○ Waiting for PitForge Link…</span>}
          </div>
          <p className="text-xs text-muted w-full mt-2">
            Open <strong>PitForge Link</strong> on your gaming PC and enter share code <strong>{shareCode}</strong>
          </p>
          <a href={`/watch/${shareCode}`} target="_blank" className="btn-secondary text-sm">
            Open pit wall view
          </a>
        </div>
      )}

      {demoMode && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
          Demo mode — simulated telemetry data. Connect the Bridge app for live LMU data.
        </div>
      )}

      {session ? (
        <PitWall data={session} trackLayoutId="gp" />
      ) : (
        <div className="card py-16 text-center text-muted">
          <Radio className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p className="mb-2">Start a telemetry session or try demo mode</p>
          <p className="text-sm">Run the Bridge app on your Windows PC with LMU to stream live data</p>
        </div>
      )}
    </div>
  );
}
