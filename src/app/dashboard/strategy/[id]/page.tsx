import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { racePlans, teams, teamMembers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { StrategyEditor } from "@/components/strategy-editor";
import type { Stint } from "@/lib/strategy";

export default async function EditStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [plan] = await db.select().from(racePlans).where(eq(racePlans.id, id)).limit(1);
  if (!plan || plan.userId !== session.id) notFound();

  const stints = JSON.parse(plan.stintsJson) as Stint[];
  const drivers = stints.length > 0
    ? Array.from(new Map(stints.map((s) => [s.driverId, { id: s.driverId, name: s.driverName, color: s.driverColor }])).values())
    : [{ id: crypto.randomUUID(), name: "Driver 1", color: "#3b82f6" }];

  const userTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.id));

  return (
    <StrategyEditor
      initialData={{
        id: plan.id,
        name: plan.name,
        trackId: plan.trackId,
        trackLayout: plan.trackLayout,
        raceDurationMinutes: plan.raceDurationMinutes,
        startTime: plan.startTime ?? "",
        timezone: plan.timezone ?? "UTC",
        carClass: plan.carClass,
        fuelPerLap: plan.fuelPerLap ?? 2.8,
        tankCapacity: plan.tankCapacity ?? 90,
        virtualEnergyPerLap: plan.virtualEnergyPerLap ?? 1.0,
        pitLossSeconds: plan.pitLossSeconds ?? 45,
        avgLapTimeSeconds: plan.avgLapTimeSeconds ?? 105,
        tyreSetsTotal: plan.tyreSetsTotal ?? 12,
        stints,
        drivers,
        teamId: plan.teamId ?? undefined,
      }}
      teams={userTeams}
    />
  );
}
