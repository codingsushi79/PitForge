import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { racePlans } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();

    const id = uuidv4();
    await db.insert(racePlans).values({
      id,
      userId: session.id,
      teamId: body.teamId,
      name: body.name,
      trackId: body.trackId,
      trackLayout: body.trackLayout,
      raceDurationMinutes: body.raceDurationMinutes,
      startTime: body.startTime || null,
      timezone: body.timezone,
      carClass: body.carClass,
      fuelPerLap: body.fuelPerLap,
      tankCapacity: body.tankCapacity,
      virtualEnergyPerLap: body.virtualEnergyPerLap,
      pitLossSeconds: body.pitLossSeconds,
      avgLapTimeSeconds: body.avgLapTimeSeconds,
      tyreSetsTotal: body.tyreSetsTotal,
      stintsJson: JSON.stringify(body.stints),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(racePlans)
      .where(eq(racePlans.id, body.id))
      .limit(1);

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db
      .update(racePlans)
      .set({
        teamId: body.teamId,
        name: body.name,
        trackId: body.trackId,
        trackLayout: body.trackLayout,
        raceDurationMinutes: body.raceDurationMinutes,
        startTime: body.startTime || null,
        timezone: body.timezone,
        carClass: body.carClass,
        fuelPerLap: body.fuelPerLap,
        tankCapacity: body.tankCapacity,
        virtualEnergyPerLap: body.virtualEnergyPerLap,
        pitLossSeconds: body.pitLossSeconds,
        avgLapTimeSeconds: body.avgLapTimeSeconds,
        tyreSetsTotal: body.tyreSetsTotal,
        stintsJson: JSON.stringify(body.stints),
        updatedAt: new Date(),
      })
      .where(eq(racePlans.id, body.id));

    return NextResponse.json({ id: body.id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
