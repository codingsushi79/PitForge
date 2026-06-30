import Link from "next/link";
import { Flame } from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: "h-4 w-4", text: "text-sm" },
  md: { icon: "h-5 w-5", text: "text-lg" },
  lg: { icon: "h-7 w-7", text: "text-2xl" },
};

export function Logo({ href = "/", size = "md", className }: LogoProps) {
  const s = sizes[size];
  const content = (
    <span className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <Flame className={cn(s.icon, "text-accent")} />
      <span className={s.text}>{brand.name}</span>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
