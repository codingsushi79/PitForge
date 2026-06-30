import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { racePlans } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { Plus, ChevronRight } from "lucide-react";

export default async function StrategyListPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plans = await db
    .select()
    .from(racePlans)
    .where(eq(racePlans.userId, session.id))
    .orderBy(desc(racePlans.updatedAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strategy plans</h1>
          <p className="text-muted">Plan stints, fuel, tyres, and pit strategy</p>
        </div>
        <Link href="/dashboard/strategy/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="mb-4">No race plans yet. Create your first strategy.</p>
          <Link href="/dashboard/strategy/new" className="btn-primary text-sm">Create plan</Link>
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
                <div className="text-xs text-muted">
                  {plan.trackId} · {plan.carClass} · {plan.raceDurationMinutes}min
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
