"use client";

import type { Stint, StrategyResult } from "@/lib/strategy";
import { formatDuration } from "@/lib/utils";
import { AlertTriangle, Clock, Fuel, Timer, CircleDot } from "lucide-react";

interface StrategyDashboardProps {
  result: StrategyResult;
  raceDurationMinutes: number;
}

export function StrategyDashboard({ result, raceDurationMinutes }: StrategyDashboardProps) {
  return (
    <div className="space-y-6">
      {result.warnings.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Strategy Warnings</span>
          </div>
          <ul className="space-y-1 text-sm text-muted">
            {result.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Timer className="h-4 w-4" />} label="Predicted Finish" value={formatDuration(result.predictedFinishMinutes * 60)} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Total Laps" value={String(result.totalLaps)} />
        <StatCard icon={<Fuel className="h-4 w-4" />} label="Fuel Used" value={`${result.totalFuelUsed.toFixed(0)}L`} />
        <StatCard icon={<CircleDot className="h-4 w-4" />} label="Pit Stops" value={String(result.totalPitStops)} />
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">Race Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          <div className="space-y-4">
            {result.timeline.map((entry, i) => (
              <div key={i} className="relative flex items-start gap-4 pl-10">
                <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full ${
                  entry.type === "start" ? "bg-accent" :
                  entry.type === "finish" ? "bg-accent-dim" :
                  entry.type === "pit" ? "bg-warning" : "bg-surface-2 border border-border"
                }`} />
                <div>
                  <span className="font-mono text-xs text-accent">{formatDuration(entry.minute * 60)}</span>
                  <p className="text-sm">{entry.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">Driver Workload</h3>
        <div className="space-y-3">
          {result.driverWorkload.map((d) => (
            <div key={d.driverId}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{d.driverName}</span>
                <span className="text-muted">{d.totalLaps} laps · {d.stintCount} stints · {d.percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">Stint Plan</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted">
              <th className="pb-2 pr-4">#</th>
              <th className="pb-2 pr-4">Driver</th>
              <th className="pb-2 pr-4">Laps</th>
              <th className="pb-2 pr-4">Tyres</th>
              <th className="pb-2 pr-4">Fuel</th>
              <th className="pb-2 pr-4">VE</th>
              <th className="pb-2 pr-4">Pit</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {result.stints.map((stint, i) => (
              <tr key={stint.id} className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted">{i + 1}</td>
                <td className="py-2 pr-4">
                  <span className="inline-block h-2 w-2 rounded-full mr-2" style={{ background: stint.driverColor }} />
                  {stint.driverName}
                </td>
                <td className="py-2 pr-4 font-mono">{stint.laps}</td>
                <td className="py-2 pr-4">Set {stint.tyreSet} · {stint.compound}</td>
                <td className="py-2 pr-4 font-mono">{stint.fuelStart.toFixed(0)}→{stint.fuelEnd.toFixed(0)}L</td>
                <td className="py-2 pr-4 font-mono">{stint.virtualEnergyUsed.toFixed(1)}</td>
                <td className="py-2 pr-4">{stint.pitStop ? "Yes" : "—"}</td>
                <td className="py-2 font-mono text-xs text-muted">
                  {formatDuration(stint.startMinute * 60)}–{formatDuration(stint.endMinute * 60)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card !p-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-mono text-xl font-semibold">{value}</p>
    </div>
  );
}

export type { Stint };
