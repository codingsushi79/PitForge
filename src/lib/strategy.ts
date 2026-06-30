export interface Stint {
  id: string;
  driverId: string;
  driverName: string;
  driverColor: string;
  laps: number;
  tyreSet: number;
  compound: "Soft" | "Medium" | "Hard" | "Wet" | "Intermediate";
  fuelStart: number;
  fuelEnd: number;
  virtualEnergyUsed: number;
  pitStop: boolean;
  startMinute: number;
  endMinute: number;
}

export interface StrategyInput {
  raceDurationMinutes: number;
  avgLapTimeSeconds: number;
  fuelPerLap: number;
  tankCapacity: number;
  virtualEnergyPerLap: number;
  pitLossSeconds: number;
  tyreSetsTotal: number;
  stints: Omit<Stint, "startMinute" | "endMinute" | "fuelStart" | "fuelEnd" | "virtualEnergyUsed">[];
}

export interface StrategyResult {
  totalLaps: number;
  predictedFinishMinutes: number;
  totalPitStops: number;
  totalFuelUsed: number;
  totalVirtualEnergy: number;
  tyreSetsUsed: number;
  stints: Stint[];
  timeline: TimelineEntry[];
  driverWorkload: DriverWorkload[];
  warnings: string[];
}

export interface TimelineEntry {
  minute: number;
  label: string;
  type: "start" | "pit" | "driver-change" | "finish" | "stint";
  driverName?: string;
}

export interface DriverWorkload {
  driverId: string;
  driverName: string;
  totalLaps: number;
  totalMinutes: number;
  stintCount: number;
  percentage: number;
}

export function calculateStrategy(input: StrategyInput): StrategyResult {
  const warnings: string[] = [];
  const lapTimeMin = input.avgLapTimeSeconds / 60;
  const totalLaps = Math.floor(input.raceDurationMinutes / lapTimeMin);

  let currentMinute = 0;
  let currentFuel = input.tankCapacity;
  const processedStints: Stint[] = [];
  const tyreSetsUsed = new Set<number>();

  for (const stint of input.stints) {
    const stintDurationMin = stint.laps * lapTimeMin + (stint.pitStop ? input.pitLossSeconds / 60 : 0);
    const fuelNeeded = stint.laps * input.fuelPerLap;
    const fuelStart = currentFuel;
    const fuelEnd = Math.max(0, currentFuel - fuelNeeded);
    const veUsed = stint.laps * input.virtualEnergyPerLap;

    if (fuelNeeded > input.tankCapacity) {
      warnings.push(`${stint.driverName}: stint needs ${fuelNeeded.toFixed(1)}L but tank holds ${input.tankCapacity}L`);
    }
    if (fuelEnd < 0) {
      warnings.push(`${stint.driverName}: insufficient fuel for ${stint.laps} laps`);
    }

    tyreSetsUsed.add(stint.tyreSet);

    processedStints.push({
      ...stint,
      fuelStart,
      fuelEnd,
      virtualEnergyUsed: veUsed,
      startMinute: currentMinute,
      endMinute: currentMinute + stintDurationMin,
    });

    currentMinute += stintDurationMin;
    currentFuel = stint.pitStop ? input.tankCapacity : fuelEnd;
  }

  const predictedFinishMinutes = currentMinute;
  const totalPitStops = input.stints.filter((s) => s.pitStop).length;
  const totalFuelUsed = processedStints.reduce((sum, s) => sum + s.laps * input.fuelPerLap, 0);
  const totalVirtualEnergy = processedStints.reduce((sum, s) => sum + s.virtualEnergyUsed, 0);

  if (tyreSetsUsed.size > input.tyreSetsTotal) {
    warnings.push(`Using ${tyreSetsUsed.size} tyre sets but only ${input.tyreSetsTotal} allocated`);
  }
  if (predictedFinishMinutes > input.raceDurationMinutes * 1.05) {
    warnings.push(`Predicted finish (${Math.round(predictedFinishMinutes)}min) exceeds race duration (${input.raceDurationMinutes}min)`);
  }

  const timeline: TimelineEntry[] = [{ minute: 0, label: "Race Start", type: "start" }];
  for (const stint of processedStints) {
    timeline.push({
      minute: stint.startMinute,
      label: `${stint.driverName} — ${stint.laps} laps (${stint.compound})`,
      type: "stint",
      driverName: stint.driverName,
    });
    if (stint.pitStop) {
      timeline.push({
        minute: stint.endMinute - input.pitLossSeconds / 60,
        label: `Pit stop — ${stint.driverName}`,
        type: "pit",
        driverName: stint.driverName,
      });
    }
  }
  timeline.push({
    minute: predictedFinishMinutes,
    label: "Predicted Finish",
    type: "finish",
  });
  timeline.sort((a, b) => a.minute - b.minute);

  const driverMap = new Map<string, { laps: number; minutes: number; stints: number; name: string }>();
  for (const stint of processedStints) {
    const existing = driverMap.get(stint.driverId) ?? { laps: 0, minutes: 0, stints: 0, name: stint.driverName };
    existing.laps += stint.laps;
    existing.minutes += stint.endMinute - stint.startMinute;
    existing.stints += 1;
    driverMap.set(stint.driverId, existing);
  }

  const driverWorkload: DriverWorkload[] = Array.from(driverMap.entries()).map(([driverId, data]) => ({
    driverId,
    driverName: data.name,
    totalLaps: data.laps,
    totalMinutes: data.minutes,
    stintCount: data.stints,
    percentage: predictedFinishMinutes > 0 ? (data.minutes / predictedFinishMinutes) * 100 : 0,
  }));

  return {
    totalLaps,
    predictedFinishMinutes,
    totalPitStops,
    totalFuelUsed,
    totalVirtualEnergy,
    tyreSetsUsed: tyreSetsUsed.size,
    stints: processedStints,
    timeline,
    driverWorkload,
    warnings,
  };
}

export function generateDefaultStints(
  drivers: { id: string; name: string; color: string }[],
  raceDurationMinutes: number,
  avgLapTimeSeconds: number
): Omit<Stint, "startMinute" | "endMinute" | "fuelStart" | "fuelEnd" | "virtualEnergyUsed">[] {
  if (drivers.length === 0) return [];

  const lapTimeMin = avgLapTimeSeconds / 60;
  const totalLaps = Math.floor(raceDurationMinutes / lapTimeMin);
  const stintsPerDriver = Math.ceil(totalLaps / drivers.length / 15);
  const lapsPerStint = Math.max(10, Math.floor(totalLaps / (drivers.length * stintsPerDriver)));

  const stints: Omit<Stint, "startMinute" | "endMinute" | "fuelStart" | "fuelEnd" | "virtualEnergyUsed">[] = [];
  let driverIdx = 0;
  let tyreSet = 1;
  let lapsRemaining = totalLaps;

  while (lapsRemaining > 0) {
    const driver = drivers[driverIdx % drivers.length];
    const laps = Math.min(lapsPerStint, lapsRemaining);
    stints.push({
      id: crypto.randomUUID(),
      driverId: driver.id,
      driverName: driver.name,
      driverColor: driver.color,
      laps,
      tyreSet,
      compound: "Medium",
      pitStop: lapsRemaining > laps,
    });
    lapsRemaining -= laps;
    driverIdx++;
    if (lapsRemaining > 0) tyreSet++;
  }

  return stints;
}
