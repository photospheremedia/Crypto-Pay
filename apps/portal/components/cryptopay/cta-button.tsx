"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CtaButton({
  href = "/signup",
  children,
  variant = "primary",
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  if (variant === "outline") {
    return (
      <Button
        asChild
        variant="outline"
        size="lg"
        className="rounded-full border-emerald-200/80 bg-white/95 px-8 text-slate-900 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-slate-900/40 dark:text-white dark:hover:bg-slate-900/70"
      >
        <Link href={href}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button
      asChild
      size="lg"
      className="group rounded-full bg-linear-to-r from-emerald-500 to-cyan-600 px-8 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-500"
    >
      <Link href={href}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}
