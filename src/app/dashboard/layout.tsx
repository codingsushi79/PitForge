import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  Flag,
  Users,
  Radio,
  Upload,
  Download,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/strategy", icon: Flag, label: "Strategy" },
  { href: "/dashboard/teams", icon: Users, label: "Teams" },
  { href: "/dashboard/telemetry", icon: Radio, label: "Telemetry" },
  { href: "/dashboard/setups", icon: Upload, label: "Setups" },
  { href: "/dashboard/bridge", icon: Download, label: "PitForge Link" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-border bg-surface">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo href="/" size="sm" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted">{session.email}</div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  );
}
