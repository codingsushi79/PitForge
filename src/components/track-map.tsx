"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import { getTrackLayout } from "@/lib/tracks";
import { progressToPosition, progressToPathPoint } from "@/lib/track-geometry";
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
  const pathRef = useRef<SVGPathElement>(null);
  const [pathReady, setPathReady] = useState(false);

  useLayoutEffect(() => {
    setPathReady(!!pathRef.current && pathRef.current.getTotalLength() > 0);
  }, [layout?.path]);

  const positionAt = useCallback(
    (progress: number): [number, number] => {
      if (!layout) return [0, 0];
      const fromPath = progressToPathPoint(pathRef.current, progress);
      if (fromPath) return fromPath;
      return progressToPosition(layout, progress);
    },
    [layout]
  );

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

  const vbParts = layout.viewBox.split(/\s+/).map(Number);
  const vbWidth = vbParts[2] || 1000;
  const trackStroke = vbWidth * 0.014;
  const innerStroke = vbWidth * 0.011;
  const markerR = vbWidth * 0.006;
  const playerR = vbWidth * 0.009;
  const pulseR = vbWidth * 0.015;
  const labelSize = vbWidth * 0.014;
  const lineHalf = vbWidth * 0.008;

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
      <svg viewBox={layout.viewBox} className="w-full" style={{ maxHeight: 320 }}>
        <path
          ref={pathRef}
          d={layout.path}
          fill="none"
          stroke="#2a2a3a"
          strokeWidth={trackStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={layout.path}
          fill="none"
          stroke="#3a3a4a"
          strokeWidth={innerStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={layout.startLine[0] - lineHalf}
          y1={layout.startLine[1] - lineHalf}
          x2={layout.startLine[0] + lineHalf}
          y2={layout.startLine[1] + lineHalf}
          stroke="#fff"
          strokeWidth={trackStroke * 0.15}
        />
        {pathReady &&
          vehicles.map((v) => {
            const [x, y] = positionAt(v.trackProgress);
            const isPlayer = v.id === playerVehicleId;
            const color = classColors[v.carClass] ?? "#888";
            return (
              <g key={v.id}>
                {isPlayer && (
                  <circle cx={x} cy={y} r={pulseR} fill={color} opacity="0.3">
                    <animate attributeName="r" values={`${playerR};${pulseR};${playerR}`} dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isPlayer ? playerR : markerR}
                  fill={color}
                  stroke={isPlayer ? "#fff" : "none"}
                  strokeWidth={isPlayer ? playerR * 0.35 : 0}
                />
                <text
                  x={x}
                  y={y - playerR * 1.5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={labelSize}
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
