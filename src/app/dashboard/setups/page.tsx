import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { setupFiles, teams, teamMembers } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { uploadFile, deleteFile } from "@/lib/storage";
import { Upload, Download, Trash2 } from "lucide-react";

export default async function SetupsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const userTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.id));

  const teamIds = userTeams.map((t) => t.id);
  const files = teamIds.length > 0
    ? await db.select().from(setupFiles).where(inArray(setupFiles.teamId, teamIds))
    : [];

  async function uploadSetup(formData: FormData) {
    "use server";
    const user = await requireSession();
    const teamId = formData.get("teamId") as string;
    const name = formData.get("name") as string;
    const carClass = formData.get("carClass") as string;
    const trackId = formData.get("trackId") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!teamId || !name || !file) redirect("/dashboard/setups");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `${uuidv4()}-${file.name}`;
    const storedPath = await uploadFile(key, buffer);

    await db.insert(setupFiles).values({
      id: uuidv4(),
      teamId,
      uploadedBy: user.id,
      name,
      carClass,
      trackId: trackId || null,
      filename: file.name,
      filePath: storedPath,
      description: description || null,
    });

    redirect("/dashboard/setups");
  }

  async function deleteSetup(formData: FormData) {
    "use server";
    await requireSession();
    const id = formData.get("id") as string;
    const [file] = await db.select().from(setupFiles).where(eq(setupFiles.id, id)).limit(1);
    if (file) {
      await deleteFile(file.filePath);
      await db.delete(setupFiles).where(eq(setupFiles.id, id));
    }
    redirect("/dashboard/setups");
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Setup files</h1>
      <p className="mb-8 text-muted">Upload and share car setups with your team</p>

      {userTeams.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          Create a team first to share setup files.
        </div>
      ) : (
        <>
          <form action={uploadSetup} className="card mb-8 space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Upload setup</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Team</label>
                <select name="teamId" className="input" required>
                  {userTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Setup name</label>
                <input name="name" required className="input" placeholder="Spa Hypercar Quali" />
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
                <label className="label">Track (optional)</label>
                <input name="trackId" className="input" placeholder="spa" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <input name="description" className="input" placeholder="Low downforce, stable in T1" />
            </div>
            <div>
              <label className="label">File</label>
              <input name="file" type="file" required className="input" />
            </div>
            <button type="submit" className="btn-primary text-sm">
              <Upload className="h-4 w-4" /> Upload
            </button>
          </form>

          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="card text-center py-8 text-muted text-sm">No setup files uploaded yet.</div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="card flex items-center justify-between !p-4">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted">
                      {file.carClass}{file.trackId ? ` · ${file.trackId}` : ""} · {file.filename}
                    </div>
                    {file.description && <div className="text-xs text-muted mt-1">{file.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/api/setups/${file.id}/download`} className="btn-secondary text-xs">
                      <Download className="h-4 w-4" />
                    </a>
                    <form action={deleteSetup}>
                      <input type="hidden" name="id" value={file.id} />
                      <button type="submit" className="btn-secondary text-xs text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
