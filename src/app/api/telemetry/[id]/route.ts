import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telemetrySessions, telemetrySnapshots } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [ts] = await db
    .select()
    .from(telemetrySessions)
    .where(eq(telemetrySessions.id, id))
    .limit(1);

  if (!ts) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [snapshot] = await db
    .select()
    .from(telemetrySnapshots)
    .where(eq(telemetrySnapshots.sessionId, id))
    .orderBy(desc(telemetrySnapshots.createdAt))
    .limit(1);

  return NextResponse.json({
    session: ts,
    telemetry: snapshot ? JSON.parse(snapshot.dataJson) : null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const [ts] = await db
    .select()
    .from(telemetrySessions)
    .where(eq(telemetrySessions.id, id))
    .limit(1);

  if (!ts || ts.status !== "active") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await db.insert(telemetrySnapshots).values({
    id: uuidv4(),
    sessionId: id,
    dataJson: JSON.stringify(body),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db
    .update(telemetrySessions)
    .set({ status: "ended" })
    .where(eq(telemetrySessions.id, id));

  return NextResponse.json({ ok: true });
}
