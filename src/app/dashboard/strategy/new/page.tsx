import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { StrategyEditor } from "@/components/strategy-editor";
import { generateDefaultStints } from "@/lib/strategy";

export default async function NewStrategyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.id));

  const defaultDrivers = [
    { id: crypto.randomUUID(), name: "Driver 1", color: "#3b82f6" },
    { id: crypto.randomUUID(), name: "Driver 2", color: "#ef4444" },
    { id: crypto.randomUUID(), name: "Driver 3", color: "#22c55e" },
  ];

  const defaultStints = generateDefaultStints(defaultDrivers, 360, 105);

  return (
    <StrategyEditor
      initialData={{
        name: "New Race Plan",
        trackId: "spa",
        trackLayout: "gp",
        raceDurationMinutes: 360,
        startTime: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        carClass: "Hypercar",
        fuelPerLap: 2.8,
        tankCapacity: 90,
        virtualEnergyPerLap: 1.0,
        pitLossSeconds: 45,
        avgLapTimeSeconds: 105,
        tyreSetsTotal: 12,
        stints: defaultStints.map((s) => ({
          ...s,
          startMinute: 0,
          endMinute: 0,
          fuelStart: 90,
          fuelEnd: 0,
          virtualEnergyUsed: 0,
        })),
        drivers: defaultDrivers,
      }}
      teams={userTeams}
    />
  );
}
