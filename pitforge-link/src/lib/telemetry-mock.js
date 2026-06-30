function createMockTelemetry(trackId = "spa") {
  const vehicles = Array.from({ length: 12 }, (_, i) => ({
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
      fl: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24, compound: "Medium" },
      fr: { wear: 20 + Math.random() * 40, temp: 85 + Math.random() * 20, pressure: 24, compound: "Medium" },
      rl: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23, compound: "Medium" },
      rr: { wear: 25 + Math.random() * 35, temp: 80 + Math.random() * 15, pressure: 23, compound: "Medium" },
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

  return {
    sessionType: "Race",
    sessionTime: 3600 + Math.random() * 1800,
    sessionRemaining: 3600,
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
}

module.exports = { createMockTelemetry };
