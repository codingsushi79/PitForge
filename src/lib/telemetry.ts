export interface TelemetryVehicle {
  id: number;
  position: number;
  driverName: string;
  teamName: string;
  carClass: string;
  lap: number;
  lapTime: number;
  bestLap: number;
  gap: number;
  gapLeader: number;
  fuel: number;
  fuelCapacity: number;
  tyres: {
    fl: TyreData;
    fr: TyreData;
    rl: TyreData;
    rr: TyreData;
  };
  trackProgress: number;
  inPits: boolean;
  pitCount: number;
  sector1: number;
  sector2: number;
  sector3: number;
  engineTemp: number;
  waterTemp: number;
  damage: number;
}

export interface TyreData {
  wear: number;
  temp: number;
  pressure: number;
  compound: string;
}

export interface TelemetryWeather {
  ambientTemp: number;
  trackTemp: number;
  rain: number;
  forecast: "dry" | "damp" | "wet";
  windSpeed: number;
}

export interface TelemetrySession {
  sessionType: string;
  sessionTime: number;
  sessionRemaining: number;
  trackName: string;
  trackId: string;
  flag: "green" | "yellow" | "red" | "blue" | "chequered" | "sc";
  vehicles: TelemetryVehicle[];
  playerVehicleId: number;
  weather: TelemetryWeather;
  warnings: TelemetryWarning[];
}

export interface TelemetryWarning {
  type: "fuel" | "tyre" | "traffic" | "rain" | "engine" | "damage";
  severity: "info" | "warning" | "critical";
  message: string;
  vehicleId?: number;
}

export function generateWarnings(data: TelemetrySession): TelemetryWarning[] {
  const warnings: TelemetryWarning[] = [];
  const player = data.vehicles.find((v) => v.id === data.playerVehicleId);

  if (player) {
    if (player.fuel < player.fuelCapacity * 0.15) {
      warnings.push({
        type: "fuel",
        severity: player.fuel < player.fuelCapacity * 0.08 ? "critical" : "warning",
        message: `Low fuel: ${player.fuel.toFixed(1)}L remaining`,
        vehicleId: player.id,
      });
    }

    for (const [corner, tyre] of Object.entries(player.tyres)) {
      if (tyre.wear > 85) {
        warnings.push({
          type: "tyre",
          severity: tyre.wear > 95 ? "critical" : "warning",
          message: `${corner.toUpperCase()} tyre wear at ${tyre.wear.toFixed(0)}%`,
          vehicleId: player.id,
        });
      }
      if (tyre.temp > 110) {
        warnings.push({
          type: "tyre",
          severity: "warning",
          message: `${corner.toUpperCase()} tyre temp high: ${tyre.temp.toFixed(0)}°C`,
          vehicleId: player.id,
        });
      }
    }

    if (player.engineTemp > 115) {
      warnings.push({
        type: "engine",
        severity: "critical",
        message: `Engine temp critical: ${player.engineTemp.toFixed(0)}°C`,
        vehicleId: player.id,
      });
    } else if (player.engineTemp > 105) {
      warnings.push({
        type: "engine",
        severity: "warning",
        message: `Engine temp elevated: ${player.engineTemp.toFixed(0)}°C`,
        vehicleId: player.id,
      });
    }

    const ahead = data.vehicles.find((v) => v.position === player.position - 1);
    const behind = data.vehicles.find((v) => v.position === player.position + 1);
    if (ahead && ahead.gap < 1.5 && !player.inPits) {
      warnings.push({
        type: "traffic",
        severity: "info",
        message: `Car ahead within ${ahead.gap.toFixed(1)}s — pit window traffic`,
        vehicleId: player.id,
      });
    }
    if (behind && behind.gap < 1.0) {
      warnings.push({
        type: "traffic",
        severity: "info",
        message: `Car behind within ${behind.gap.toFixed(1)}s`,
        vehicleId: player.id,
      });
    }
  }

  if (data.weather.rain > 0.3) {
    warnings.push({
      type: "rain",
      severity: data.weather.rain > 0.6 ? "critical" : "warning",
      message: `Rain intensity ${(data.weather.rain * 100).toFixed(0)}% — consider wet tyres`,
    });
  }

  if (data.flag === "yellow" || data.flag === "sc") {
    warnings.push({
      type: "traffic",
      severity: "warning",
      message: data.flag === "sc" ? "Safety Car deployed" : "Yellow flag — caution",
    });
  }

  return warnings;
}

export function createMockTelemetry(trackId = "spa"): TelemetrySession {
  const vehicles: TelemetryVehicle[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    position: i + 1,
    driverName: `Driver ${i + 1}`,
    teamName: `Team ${String.fromCharCode(65 + (i % 5))}`,
    carClass: i < 4 ? "Hypercar" : "LMGT3",
    lap: 15 + Math.floor(Math.random() * 3),
    lapTime: 105 + Math.random() * 8,
    bestLap: 103 + Math.random() * 3,
    gap: i === 0 ? 0 : 1 + i * 2.5 + Math.random() * 3,
    gapLeader: i === 0 ? 0 : 1 + i * 2.5 + Math.random() * 3,
    fuel: 30 + Math.random() * 50,
    fuelCapacity: 90,
    tyres: {
      fl: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24 + Math.random() * 2, compound: "Medium" },
      fr: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24 + Math.random() * 2, compound: "Medium" },
      rl: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23 + Math.random() * 2, compound: "Medium" },
      rr: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23 + Math.random() * 2, compound: "Medium" },
    },
    trackProgress: Math.random(),
    inPits: false,
    pitCount: Math.floor(Math.random() * 3),
    sector1: 28 + Math.random() * 3,
    sector2: 35 + Math.random() * 4,
    sector3: 40 + Math.random() * 4,
    engineTemp: 95 + Math.random() * 15,
    waterTemp: 85 + Math.random() * 10,
    damage: Math.random() * 5,
  }));

  const session: TelemetrySession = {
    sessionType: "Race",
    sessionTime: 3600 + Math.random() * 1800,
    sessionRemaining: 7200 - 3600,
    trackName: trackId,
    trackId,
    flag: "green",
    vehicles,
    playerVehicleId: 3,
    weather: {
      ambientTemp: 22 + Math.random() * 5,
      trackTemp: 35 + Math.random() * 10,
      rain: Math.random() * 0.1,
      forecast: "dry",
      windSpeed: 5 + Math.random() * 10,
    },
    warnings: [],
  };
  session.warnings = generateWarnings(session);
  return session;
}
