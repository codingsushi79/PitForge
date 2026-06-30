import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export default function NewTeamPage() {
  async function createTeam(formData: FormData) {
    "use server";
    const session = await requireSession();
    const name = formData.get("name") as string;
    if (!name) redirect("/dashboard/teams/new");

    const teamId = uuidv4();
    await db.insert(teams).values({ id: teamId, name, ownerId: session.id });
    await db.insert(teamMembers).values({
      id: uuidv4(),
      teamId,
      userId: session.id,
      role: "owner",
    });

    redirect(`/dashboard/teams/${teamId}`);
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-2 text-2xl font-bold">Create team</h1>
      <p className="mb-8 text-muted">Set up a shared workspace for your drivers and engineers.</p>
      <form action={createTeam} className="card space-y-4">
        <div>
          <label className="label">Team name</label>
          <input name="name" type="text" required className="input" placeholder="e.g. Apex Racing" />
        </div>
        <button type="submit" className="btn-primary w-full">Create team</button>
        <Link href="/dashboard/teams" className="block text-center text-sm text-muted hover:text-white">Cancel</Link>
      </form>
    </div>
  );
}
