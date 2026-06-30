import Link from "next/link";
import { getSession } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { Logo } from "@/components/logo";
import { Radio, Users, Flag, LayoutDashboard, LogOut } from "lucide-react";

export async function Nav() {
  const session = await getSession();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo href="/" />

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm text-muted transition hover:text-white">
            Features
          </Link>
          <Link href="/#telemetry" className="text-sm text-muted transition hover:text-white">
            Telemetry
          </Link>
          <Link href="/#pricing" className="text-sm text-muted transition hover:text-white">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="btn-secondary text-xs">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="btn-secondary text-xs">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-xs">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-xs">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function FeatureIcon({ icon }: { icon: "strategy" | "teams" | "telemetry" }) {
  const icons = {
    strategy: <Flag className="h-6 w-6" />,
    teams: <Users className="h-6 w-6" />,
    telemetry: <Radio className="h-6 w-6" />,
  };
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
      {icons[icon]}
    </div>
  );
}
