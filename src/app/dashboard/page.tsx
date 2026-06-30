import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, racePlans, lineups } from "@/lib/db";
import { eq, or, desc } from "drizzle-orm";
import {
  Flag,
  Users,
  Radio,
  Plus,
  ChevronRight,
  Upload,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userTeams = await db
    .select({ team: teams, membership: teamMembers })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.id));

  const plans = await db
    .select()
    .from(racePlans)
    .where(or(eq(racePlans.userId, session.id)))
    .orderBy(desc(racePlans.updatedAt))
    .limit(5);

  const allLineups = userTeams.length > 0
    ? await db.select().from(lineups).where(
        eq(lineups.teamId, userTeams[0].team.id)
      )
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {session.name}</h1>
        <p className="text-muted">Your endurance racing command center</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/dashboard/strategy/new" icon={<Flag className="h-5 w-5" />} label="New race plan" />
        <QuickAction href="/dashboard/teams/new" icon={<Users className="h-5 w-5" />} label="Create team" />
        <QuickAction href="/dashboard/telemetry" icon={<Radio className="h-5 w-5" />} label="Live telemetry" />
        <QuickAction href="/dashboard/setups" icon={<Upload className="h-5 w-5" />} label="Setup files" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent race plans</h2>
            <Link href="/dashboard/strategy" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {plans.length === 0 ? (
            <div className="card text-center text-muted">
              <p className="mb-4">No race plans yet</p>
              <Link href="/dashboard/strategy/new" className="btn-primary text-sm">
                <Plus className="h-4 w-4" /> Create your first plan
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/dashboard/strategy/${plan.id}`}
                  className="card flex items-center justify-between !p-4 transition hover:border-accent/30"
                >
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-xs text-muted">{plan.trackId} · {plan.carClass}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your teams</h2>
            <Link href="/dashboard/teams" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {userTeams.length === 0 ? (
            <div className="card text-center text-muted">
              <p className="mb-4">No teams yet</p>
              <Link href="/dashboard/teams/new" className="btn-primary text-sm">
                <Plus className="h-4 w-4" /> Create a team
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userTeams.map(({ team }) => (
                <Link
                  key={team.id}
                  href={`/dashboard/teams/${team.id}`}
                  className="card flex items-center justify-between !p-4 transition hover:border-accent/30"
                >
                  <div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted">{allLineups.filter(l => l.teamId === team.id).length} lineups</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="card flex items-center gap-3 !p-4 transition hover:border-accent/30 hover:glow-accent">
      <div className="text-accent">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
