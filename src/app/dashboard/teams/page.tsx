import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Plus, ChevronRight } from "lucide-react";

export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userTeams = await db
    .select({ team: teams, membership: teamMembers })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.id));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-muted">Organize drivers and share race plans</p>
        </div>
        <Link href="/dashboard/teams/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New team
        </Link>
      </div>

      {userTeams.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="mb-4">Create a team to organize lineups and share plans.</p>
          <Link href="/dashboard/teams/new" className="btn-primary text-sm">Create team</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {userTeams.map(({ team, membership }) => (
            <Link
              key={team.id}
              href={`/dashboard/teams/${team.id}`}
              className="card flex items-center justify-between !p-4 transition hover:border-accent/30"
            >
              <div>
                <div className="font-medium">{team.name}</div>
                <div className="text-xs text-muted capitalize">{membership.role}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
