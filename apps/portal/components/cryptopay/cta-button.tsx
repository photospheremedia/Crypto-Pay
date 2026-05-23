"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaButton({
  href = "/signup",
  children = "Start Accepting Crypto",
  variant = "primary",
}: {
  href?: string;
  children?: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  if (variant === "outline") {
    return (
      <Button
        asChild
        variant="outline"
        size="lg"
        className="rounded-full px-8 border-orange-200/80 bg-white/95 text-slate-900 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-slate-900/40 dark:text-white dark:hover:bg-slate-900/70"
      >
        <Link href={href}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button
      asChild
      size="lg"
      className="group rounded-full bg-gradient-to-r from-orange-500 to-emerald-600 px-8 text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-emerald-500"
    >
      <Link href={href}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}
