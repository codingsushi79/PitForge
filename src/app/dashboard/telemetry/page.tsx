"use client";

import { useState, useEffect, useCallback } from "react";
import { PitWall } from "@/components/pit-wall";
import { createMockTelemetry, type TelemetrySession } from "@/lib/telemetry";
import { Radio, Copy, Check, Play, Square, ExternalLink } from "lucide-react";

export default function TelemetryPage() {
  const [session, setSession] = useState<TelemetrySession | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("spa");
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [linkConnected, setLinkConnected] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/telemetry/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setSession(data.telemetry);
          setLinkConnected(true);
        }
      }
    } catch {
      /* link may be offline */
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || previewMode) return;
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, [sessionId, previewMode, fetchTelemetry]);

  useEffect(() => {
    if (!previewMode) return;
    setSession(createMockTelemetry(trackId));
    const interval = setInterval(() => setSession(createMockTelemetry(trackId)), 2000);
    return () => clearInterval(interval);
  }, [previewMode, trackId]);

  async function startSession() {
    const res = await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessionId(data.id);
      setSessionKey(data.shareCode);
    }
  }

  async function endSession() {
    if (sessionId) {
      await fetch(`/api/telemetry/${sessionId}`, { method: "DELETE" });
    }
    setSessionId(null);
    setSessionKey(null);
    setSession(null);
    setPreviewMode(false);
    setLinkConnected(false);
  }

  function copyKey() {
    if (sessionKey) {
      navigator.clipboard.writeText(sessionKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live telemetry</h1>
          <p className="text-muted">Your race-day pit wall — track map, standings, and warnings</p>
        </div>
        <div className="flex items-center gap-3">
          {!sessionId && !previewMode && (
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
              <button onClick={() => setPreviewMode(true)} className="btn-secondary text-sm">
                <Play className="h-4 w-4" /> Preview pit wall
              </button>
            </>
          )}
          {(sessionId || previewMode) && (
            <button onClick={endSession} className="btn-secondary text-sm">
              <Square className="h-4 w-4" /> End session
            </button>
          )}
        </div>
      </div>

      {sessionKey && (
        <div className="mb-6 card flex flex-wrap items-center gap-4 !p-4">
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Session key</span>
            <div className="font-mono text-2xl font-bold text-accent">{sessionKey}</div>
          </div>
          <button onClick={copyKey} className="btn-secondary text-sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy key"}
          </button>
          <div className="text-sm text-muted">
            {linkConnected ? (
              <span className="text-accent">● PitForge Link connected</span>
            ) : (
              <span className="text-warning">○ Waiting for PitForge Link…</span>
            )}
          </div>
          <p className="text-sm text-muted w-full">
            On your gaming PC, open <strong>PitForge Link</strong> and enter session key{" "}
            <strong className="text-accent">{sessionKey}</strong>
          </p>
          <a href={`/watch/${sessionKey}`} target="_blank" className="btn-secondary text-sm">
            <ExternalLink className="h-4 w-4" /> Open viewer link
          </a>
        </div>
      )}

      {previewMode && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
          Preview mode — sample pit wall data for layout and features.
        </div>
      )}

      {session ? (
        <PitWall data={session} trackLayoutId="gp" />
      ) : (
        <div className="card py-16 text-center text-muted">
          <Radio className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p className="mb-2">Start a session to open your pit wall</p>
          <p className="text-sm">
            Connect PitForge Link on your gaming PC, or preview the layout first
          </p>
        </div>
      )}
    </div>
  );
}
