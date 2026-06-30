import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { telemetrySessions, telemetrySnapshots } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateShareCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();

    const id = uuidv4();
    const shareCode = generateShareCode();

    await db.insert(telemetrySessions).values({
      id,
      userId: session.id,
      teamId: body.teamId ?? null,
      racePlanId: body.racePlanId ?? null,
      shareCode,
      trackId: body.trackId ?? "spa",
      status: "active",
    });

    return NextResponse.json({ id, shareCode });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  const shareCode = req.nextUrl.searchParams.get("code");
  if (!shareCode) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const code = shareCode.toUpperCase().trim();
  const [ts] = await db
    .select()
    .from(telemetrySessions)
    .where(eq(telemetrySessions.shareCode, code))
    .limit(1);

  if (!ts || ts.status !== "active") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const [snapshot] = await db
    .select()
    .from(telemetrySnapshots)
    .where(eq(telemetrySnapshots.sessionId, ts.id))
    .orderBy(desc(telemetrySnapshots.createdAt))
    .limit(1);

  return NextResponse.json({
    sessionId: ts.id,
    trackId: ts.trackId,
    telemetry: snapshot ? JSON.parse(snapshot.dataJson) : null,
  });
}
