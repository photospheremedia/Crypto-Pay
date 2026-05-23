"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClientOptional } from "@crypto-pay/db/supabaseClient";
import { Button } from "@/components/ui/button";
import { CryptoPayLogo } from "./crypto-pay-logo";
import { NAV_LINKS } from "@/lib/cryptopay/constants";
import { cn } from "@/lib/utils";

export function CryptoPayHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClientOptional();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setIsAuthed(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsAuthed(!!session?.user);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <CryptoPayLogo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === link.href
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {isAuthed ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/account">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-gradient-to-r from-orange-500 to-emerald-600 text-white hover:from-orange-400 hover:to-emerald-500"
              >
                <Link href="/signup">Start Accepting Crypto</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 md:hidden dark:border-slate-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={isAuthed ? "/account" : "/login"}>
                {isAuthed ? "Dashboard" : "Log in"}
              </Link>
            </Button>
            {!isAuthed && (
              <Button asChild className="w-full rounded-full bg-emerald-600">
                <Link href="/signup">Start Accepting Crypto</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
