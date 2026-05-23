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
      <Button asChild variant="outline" size="lg" className="rounded-full px-8">
        <Link href={href}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button
      asChild
      size="lg"
      className="group rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-cyan-500"
    >
      <Link href={href}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}
