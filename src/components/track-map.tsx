"use client";

import { getTrackLayout, progressToPosition } from "@/lib/tracks";
import type { TelemetryVehicle } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

interface TrackMapProps {
  trackId: string;
  layoutId: string;
  vehicles: TelemetryVehicle[];
  playerVehicleId?: number;
  className?: string;
}

export function TrackMap({
  trackId,
  layoutId,
  vehicles,
  playerVehicleId,
  className,
}: TrackMapProps) {
  const layout = getTrackLayout(trackId, layoutId);
  if (!layout) {
    return (
      <div className={cn("card flex items-center justify-center text-muted", className)}>
        Track map unavailable
      </div>
    );
  }

  const classColors: Record<string, string> = {
    Hypercar: "#e85d04",
    LMP2: "#6366f1",
    LMGT3: "#f59e0b",
    GTE: "#ef4444",
  };

  return (
    <div className={cn("card relative overflow-hidden p-4", className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Live Track Map
        </span>
        <div className="flex gap-3 text-[10px] text-muted">
          {Object.entries(classColors).map(([cls, color]) => (
            <span key={cls} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
              {cls}
            </span>
          ))}
        </div>
      </div>
      <svg
        viewBox={layout.viewBox}
        className="w-full"
        style={{ maxHeight: 320 }}
      >
        <path
          d={layout.path}
          fill="none"
          stroke="#2a2a3a"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={layout.path}
          fill="none"
          stroke="#3a3a4a"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={layout.startLine[0] - 8}
          y1={layout.startLine[1] - 8}
          x2={layout.startLine[0] + 8}
          y2={layout.startLine[1] + 8}
          stroke="#fff"
          strokeWidth="2"
        />
        {vehicles.map((v) => {
          const [x, y] = progressToPosition(layout, v.trackProgress);
          const isPlayer = v.id === playerVehicleId;
          const color = classColors[v.carClass] ?? "#888";
          return (
            <g key={v.id}>
              {isPlayer && (
                <circle cx={x} cy={y} r="10" fill={color} opacity="0.3">
                  <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={isPlayer ? 6 : 4}
                fill={color}
                stroke={isPlayer ? "#fff" : "none"}
                strokeWidth={isPlayer ? 2 : 0}
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fill="#fff"
                fontSize="9"
                fontFamily="monospace"
              >
                P{v.position}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
