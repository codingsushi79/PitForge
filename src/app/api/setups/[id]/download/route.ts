import { NextRequest, NextResponse } from "next/server";
import { db, setupFiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { downloadFile } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [file] = await db.select().from(setupFiles).where(eq(setupFiles.id, id)).limit(1);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buffer = await downloadFile(file.filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
