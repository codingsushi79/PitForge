import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, lineups, drivers, racePlans } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Plus, Users, Flag } from "lucide-react";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, id), eq(teamMembers.userId, session.id)))
    .limit(1);

  if (!membership) notFound();

  const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  if (!team) notFound();

  const teamLineups = await db.select().from(lineups).where(eq(lineups.teamId, id));
  const lineupIds = teamLineups.map((l) => l.id);
  const allDrivers = lineupIds.length > 0
    ? await db.select().from(drivers).where(inArray(drivers.lineupId, lineupIds))
    : [];
  const teamPlans = await db.select().from(racePlans).where(eq(racePlans.teamId, id));

  async function createLineup(formData: FormData) {
    "use server";
    await requireSession();
    const name = formData.get("name") as string;
    const carClass = formData.get("carClass") as string;
    const lineupId = uuidv4();
    await db.insert(lineups).values({ id: lineupId, teamId: id, name, carClass });

    const driverNames = (formData.get("drivers") as string).split(",").map((d) => d.trim()).filter(Boolean);
    for (let i = 0; i < driverNames.length; i++) {
      await db.insert(drivers).values({
        id: uuidv4(),
        lineupId,
        name: driverNames[i],
        color: ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"][i % 4],
        sortOrder: i,
      });
    }
    redirect(`/dashboard/teams/${id}`);
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{team.name}</h1>
      <p className="mb-8 text-muted">Team workspace</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Lineups</h2>
          </div>

          {teamLineups.length > 0 && (
            <div className="mb-4 space-y-2">
              {teamLineups.map((lineup) => {
                const lineupDrivers = allDrivers.filter((d) => d.lineupId === lineup.id);
                return (
                  <div key={lineup.id} className="card !p-4">
                    <div className="font-medium">{lineup.name}</div>
                    <div className="text-xs text-muted mb-2">{lineup.carClass}</div>
                    <div className="flex flex-wrap gap-2">
                      {lineupDrivers.map((d) => (
                        <span key={d.id} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs">
                          <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form action={createLineup} className="card space-y-4">
            <h3 className="text-sm font-medium">New lineup</h3>
            <div>
              <label className="label">Name</label>
              <input name="name" required className="input" placeholder="e.g. Hypercar Squad" />
            </div>
            <div>
              <label className="label">Car class</label>
              <select name="carClass" className="input">
                <option>Hypercar</option>
                <option>LMP2</option>
                <option>LMGT3</option>
              </select>
            </div>
            <div>
              <label className="label">Drivers (comma-separated)</label>
              <input name="drivers" required className="input" placeholder="Alex, Ben, Chris" />
            </div>
            <button type="submit" className="btn-primary text-sm w-full">
              <Plus className="h-4 w-4" /> Create lineup
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Team race plans</h2>
          </div>
          {teamPlans.length === 0 ? (
            <div className="card text-center py-8 text-muted text-sm">
              No team race plans yet. Create a strategy and assign it to this team.
            </div>
          ) : (
            <div className="space-y-2">
              {teamPlans.map((plan) => (
                <Link key={plan.id} href={`/dashboard/strategy/${plan.id}`} className="card !p-4 block hover:border-accent/30 transition">
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-muted">{plan.trackId} · {plan.carClass}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
