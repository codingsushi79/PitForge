"use client";

import type { TelemetrySession, TelemetryWarning } from "@/lib/telemetry";
import { resolvePlayerVehicle } from "@/lib/telemetry";
import { formatDuration, formatLapTime } from "@/lib/utils";
import { TrackMap } from "./track-map";
import {
  AlertTriangle,
  Cloud,
  Droplets,
  Flag,
  Fuel,
  Thermometer,
  Wind,
} from "lucide-react";

interface PitWallProps {
  data: TelemetrySession;
  trackLayoutId?: string;
}

export function PitWall({ data, trackLayoutId = "gp" }: PitWallProps) {
  const player = resolvePlayerVehicle(data);
  const playerVehicleId = player?.id ?? data.playerVehicleId;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <FlagBadge flag={data.flag} />
        <span className="font-mono text-sm text-muted">
          {data.sessionType} · {formatDuration(data.sessionTime)} elapsed · {formatDuration(data.sessionRemaining)} remaining
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <TrackMap
            trackId={data.trackId}
            layoutId={trackLayoutId}
            vehicles={data.vehicles}
            playerVehicleId={playerVehicleId}
          />

          {data.warnings.length > 0 && (
            <div className="grid gap-2">
              {data.warnings.map((w, i) => (
                <WarningCard key={i} warning={w} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <WeatherCard weather={data.weather} />
          {player && <PlayerCard player={player} />}
        </div>
      </div>

      <StandingsTable vehicles={data.vehicles} playerVehicleId={playerVehicleId} />

      {player && <TyrePanel tyres={player.tyres} />}
    </div>
  );
}

function FlagBadge({ flag }: { flag: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    chequered: "bg-white/20 text-white border-white/30",
    sc: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${colors[flag] ?? colors.green}`}>
      {flag === "sc" ? "Safety Car" : `${flag} flag`}
    </span>
  );
}

function WarningCard({ warning }: { warning: TelemetryWarning }) {
  const colors = {
    info: "border-blue-500/30 bg-blue-500/5 text-blue-300",
    warning: "border-warning/30 bg-warning/5 text-warning",
    critical: "border-danger/30 bg-danger/5 text-danger",
  };
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${colors[warning.severity]}`}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {warning.message}
    </div>
  );
}

function WeatherCard({ weather }: { weather: TelemetrySession["weather"] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Weather</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted" />
          <span>Ambient {weather.ambientTemp.toFixed(0)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-accent" />
          <span>Track {weather.trackTemp.toFixed(0)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-muted" />
          <span>Rain {(weather.rain * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-muted" />
          <span>{weather.windSpeed.toFixed(0)} km/h</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted" />
          <span className="capitalize">Forecast: {weather.forecast}</span>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: TelemetrySession["vehicles"][0] }) {
  return (
    <div className="card">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Your Car</h3>
      <div className="mb-3 text-sm">
        <div className="font-semibold">#{player.carNumber} {player.teamName}</div>
        <div className="text-muted">{player.driverName}</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Position</span>
          <span className="font-mono font-semibold">P{player.position}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Lap</span>
          <span className="font-mono">{player.lap}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Last Lap</span>
          <span className="font-mono">{formatLapTime(player.lapTime)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Best Lap</span>
          <span className="font-mono text-accent">{formatLapTime(player.bestLap)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Gap to Leader</span>
          <span className="font-mono">+{player.gapLeader.toFixed(1)}s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted flex items-center gap-1"><Fuel className="h-3 w-3" /> Fuel</span>
          <span className="font-mono">{player.fuel.toFixed(1)}L / {player.fuelCapacity}L</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full ${player.fuel / player.fuelCapacity < 0.15 ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${(player.fuel / player.fuelCapacity) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StandingsTable({ vehicles, playerVehicleId }: { vehicles: TelemetrySession["vehicles"]; playerVehicleId: number }) {
  return (
    <div className="card overflow-x-auto">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Live Standings</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted">
            <th className="pb-2 pr-3">Pos</th>
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-3">Driver</th>
            <th className="pb-2 pr-3">Team</th>
            <th className="pb-2 pr-3">Class</th>
            <th className="pb-2 pr-3">Lap</th>
            <th className="pb-2 pr-3">Last</th>
            <th className="pb-2 pr-3">Best</th>
            <th className="pb-2 pr-3">Gap</th>
            <th className="pb-2 pr-3">Fuel</th>
            <th className="pb-2">Pits</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr
              key={v.id}
              className={`border-b border-border/50 ${v.id === playerVehicleId ? "bg-accent/5" : ""}`}
            >
              <td className="py-1.5 pr-3 font-mono font-semibold">{v.position}</td>
              <td className="py-1.5 pr-3 font-mono text-muted">{v.carNumber}</td>
              <td className="py-1.5 pr-3">{v.driverName}</td>
              <td className="py-1.5 pr-3 text-xs text-muted">{v.teamName}</td>
              <td className="py-1.5 pr-3 text-xs text-muted">{v.carClass}</td>
              <td className="py-1.5 pr-3 font-mono">{v.lap}</td>
              <td className="py-1.5 pr-3 font-mono">{formatLapTime(v.lapTime)}</td>
              <td className="py-1.5 pr-3 font-mono text-accent">{formatLapTime(v.bestLap)}</td>
              <td className="py-1.5 pr-3 font-mono">{v.gapLeader > 0 ? `+${v.gapLeader.toFixed(1)}` : "—"}</td>
              <td className="py-1.5 pr-3 font-mono">{v.fuel.toFixed(0)}L</td>
              <td className="py-1.5 font-mono">{v.pitCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TyrePanel({ tyres }: { tyres: TelemetrySession["vehicles"][0]["tyres"] }) {
  const corners = [
    { key: "fl", label: "FL" },
    { key: "fr", label: "FR" },
    { key: "rl", label: "RL" },
    { key: "rr", label: "RR" },
  ] as const;

  return (
    <div className="card">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Tyres & Brakes</h3>
      <div className="grid grid-cols-4 gap-4">
        {corners.map(({ key, label }) => {
          const t = tyres[key];
          return (
            <div key={key} className="text-center">
              <span className="text-xs font-medium text-muted">{label}</span>
              <div className="mt-1 font-mono text-lg">{t.wear.toFixed(0)}%</div>
              <div className="h-1.5 mt-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${t.wear > 80 ? "bg-danger" : t.wear > 60 ? "bg-warning" : "bg-accent"}`}
                  style={{ width: `${t.wear}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted">{t.temp.toFixed(0)}°C · {t.compound}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
