"use client";

import { useState, useMemo } from "react";
import { calculateStrategy, type Stint } from "@/lib/strategy";
import { StrategyDashboard } from "@/components/strategy-dashboard";
import { TRACKS, CAR_CLASSES } from "@/lib/tracks";
import { Plus, Trash2, Save } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  color: string;
}

interface StrategyEditorProps {
  initialData: {
    id?: string;
    name: string;
    trackId: string;
    trackLayout: string;
    raceDurationMinutes: number;
    startTime: string;
    timezone: string;
    carClass: string;
    fuelPerLap: number;
    tankCapacity: number;
    virtualEnergyPerLap: number;
    pitLossSeconds: number;
    avgLapTimeSeconds: number;
    tyreSetsTotal: number;
    stints: Stint[];
    drivers: Driver[];
    teamId?: string;
    lineupId?: string;
  };
  teams?: { id: string; name: string }[];
  lineups?: { id: string; name: string; teamId: string }[];
}

const DRIVER_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];

export function StrategyEditor({ initialData, teams = [], lineups = [] }: StrategyEditorProps) {
  const [name, setName] = useState(initialData.name);
  const [trackId, setTrackId] = useState(initialData.trackId);
  const [trackLayout, setTrackLayout] = useState(initialData.trackLayout);
  const [raceDurationMinutes, setRaceDurationMinutes] = useState(initialData.raceDurationMinutes);
  const [startTime, setStartTime] = useState(initialData.startTime);
  const [timezone, setTimezone] = useState(initialData.timezone);
  const [carClass, setCarClass] = useState(initialData.carClass);
  const [fuelPerLap, setFuelPerLap] = useState(initialData.fuelPerLap);
  const [tankCapacity, setTankCapacity] = useState(initialData.tankCapacity);
  const [virtualEnergyPerLap, setVirtualEnergyPerLap] = useState(initialData.virtualEnergyPerLap);
  const [pitLossSeconds, setPitLossSeconds] = useState(initialData.pitLossSeconds);
  const [avgLapTimeSeconds, setAvgLapTimeSeconds] = useState(initialData.avgLapTimeSeconds);
  const [tyreSetsTotal, setTyreSetsTotal] = useState(initialData.tyreSetsTotal);
  const [stints, setStints] = useState<Stint[]>(initialData.stints);
  const [drivers, setDrivers] = useState<Driver[]>(initialData.drivers);
  const [teamId, setTeamId] = useState(initialData.teamId ?? "");
  const [saving, setSaving] = useState(false);

  const selectedTrack = TRACKS.find((t) => t.id === trackId);

  const result = useMemo(
    () =>
      calculateStrategy({
        raceDurationMinutes,
        avgLapTimeSeconds,
        fuelPerLap,
        tankCapacity,
        virtualEnergyPerLap,
        pitLossSeconds,
        tyreSetsTotal,
        stints,
      }),
    [raceDurationMinutes, avgLapTimeSeconds, fuelPerLap, tankCapacity, virtualEnergyPerLap, pitLossSeconds, tyreSetsTotal, stints]
  );

  function addDriver() {
    const idx = drivers.length;
    setDrivers([
      ...drivers,
      { id: crypto.randomUUID(), name: `Driver ${idx + 1}`, color: DRIVER_COLORS[idx % DRIVER_COLORS.length] },
    ]);
  }

  function addStint() {
    const driver = drivers[0];
    if (!driver) return;
    setStints([
      ...stints,
      {
        id: crypto.randomUUID(),
        driverId: driver.id,
        driverName: driver.name,
        driverColor: driver.color,
        laps: 15,
        tyreSet: Math.max(...stints.map((s) => s.tyreSet), 0) + 1,
        compound: "Medium",
        pitStop: true,
        startMinute: 0,
        endMinute: 0,
        fuelStart: tankCapacity,
        fuelEnd: 0,
        virtualEnergyUsed: 0,
      },
    ]);
  }

  function updateStint(id: string, updates: Partial<Stint>) {
    setStints(stints.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function removeStint(id: string) {
    setStints(stints.filter((s) => s.id !== id));
  }

  async function save() {
    setSaving(true);
    const payload = {
      id: initialData.id,
      name,
      trackId,
      trackLayout,
      raceDurationMinutes,
      startTime,
      timezone,
      carClass,
      fuelPerLap,
      tankCapacity,
      virtualEnergyPerLap,
      pitLossSeconds,
      avgLapTimeSeconds,
      tyreSetsTotal,
      stints,
      drivers,
      teamId: teamId || null,
    };
    const res = await fetch("/api/strategy", {
      method: initialData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (!initialData.id) window.location.href = `/dashboard/strategy/${data.id}`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-2xl font-bold outline-none border-b border-transparent focus:border-accent"
        />
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save plan"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="card space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Race settings</h3>
            <div>
              <label className="label">Track</label>
              <select value={trackId} onChange={(e) => { setTrackId(e.target.value); setTrackLayout(TRACKS.find(t => t.id === e.target.value)?.layouts[0]?.id ?? "gp"); }} className="input">
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Layout</label>
              <select value={trackLayout} onChange={(e) => setTrackLayout(e.target.value)} className="input">
                {selectedTrack?.layouts.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.lengthKm} km)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Car class</label>
              <select value={carClass} onChange={(e) => setCarClass(e.target.value)} className="input">
                {CAR_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {teams.length > 0 && (
              <div>
                <label className="label">Team (optional)</label>
                <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="input">
                  <option value="">Personal plan</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Duration (min)</label>
                <input type="number" value={raceDurationMinutes} onChange={(e) => setRaceDurationMinutes(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Avg lap (sec)</label>
                <input type="number" step="0.1" value={avgLapTimeSeconds} onChange={(e) => setAvgLapTimeSeconds(Number(e.target.value))} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start time</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Timezone</label>
                <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input" placeholder="Europe/Paris" />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Fuel & tyres</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fuel/lap (L)</label>
                <input type="number" step="0.1" value={fuelPerLap} onChange={(e) => setFuelPerLap(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Tank (L)</label>
                <input type="number" value={tankCapacity} onChange={(e) => setTankCapacity(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">VE/lap</label>
                <input type="number" step="0.1" value={virtualEnergyPerLap} onChange={(e) => setVirtualEnergyPerLap(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Pit loss (sec)</label>
                <input type="number" value={pitLossSeconds} onChange={(e) => setPitLossSeconds(Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Tyre sets</label>
                <input type="number" value={tyreSetsTotal} onChange={(e) => setTyreSetsTotal(Number(e.target.value))} className="input" />
              </div>
            </div>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Drivers</h3>
              <button onClick={addDriver} className="text-accent hover:text-accent-dim"><Plus className="h-4 w-4" /></button>
            </div>
            {drivers.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2">
                <input type="color" value={d.color} onChange={(e) => setDrivers(drivers.map((dr, j) => j === i ? { ...dr, color: e.target.value } : dr))} className="h-8 w-8 cursor-pointer rounded border-0" />
                <input value={d.name} onChange={(e) => {
                  const newName = e.target.value;
                  setDrivers(drivers.map((dr, j) => j === i ? { ...dr, name: newName } : dr));
                  setStints(stints.map(s => s.driverId === d.id ? { ...s, driverName: newName } : s));
                }} className="input flex-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Stints</h3>
              <button onClick={addStint} className="btn-secondary text-xs"><Plus className="h-3 w-3" /> Add stint</button>
            </div>
            <div className="space-y-3">
              {stints.map((stint, i) => (
                <div key={stint.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-3">
                  <span className="text-xs text-muted w-6">{i + 1}</span>
                  <select value={stint.driverId} onChange={(e) => {
                    const d = drivers.find(dr => dr.id === e.target.value);
                    if (d) updateStint(stint.id, { driverId: d.id, driverName: d.name, driverColor: d.color });
                  }} className="input !w-auto !py-1.5 text-xs">
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <input type="number" value={stint.laps} onChange={(e) => updateStint(stint.id, { laps: Number(e.target.value) })} className="input !w-16 !py-1.5 text-xs" title="Laps" />
                  <span className="text-xs text-muted">laps</span>
                  <select value={stint.compound} onChange={(e) => updateStint(stint.id, { compound: e.target.value as Stint["compound"] })} className="input !w-auto !py-1.5 text-xs">
                    {["Soft", "Medium", "Hard", "Wet", "Intermediate"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="number" value={stint.tyreSet} onChange={(e) => updateStint(stint.id, { tyreSet: Number(e.target.value) })} className="input !w-14 !py-1.5 text-xs" title="Tyre set" />
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={stint.pitStop} onChange={(e) => updateStint(stint.id, { pitStop: e.target.checked })} />
                    Pit
                  </label>
                  <button onClick={() => removeStint(stint.id)} className="ml-auto text-danger hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <StrategyDashboard result={result} raceDurationMinutes={raceDurationMinutes} />
        </div>
      </div>
    </div>
  );
}
