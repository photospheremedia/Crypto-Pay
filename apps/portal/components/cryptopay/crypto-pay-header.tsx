"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClientOptional } from "@crypto-pay/db/supabaseClient";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/cryptopay/constants";
import { cn } from "@/lib/utils";
import { CryptoPayLogo } from "./crypto-pay-logo";

export function CryptoPayHeader() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
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
      },
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <LocaleSwitcher appearance="marketing" />
          <span
            className="mx-0.5 hidden h-5 w-px bg-slate-200 lg:block dark:bg-slate-700"
            aria-hidden
          />
          {isAuthed ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/account">{tCommon("dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">{tCommon("logIn")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-linear-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-400 hover:to-cyan-500"
              >
                <Link href="/signup">{tCommon("getStartedFree")}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button
            type="button"
            className={cn(
              "rounded-lg border p-2 transition-colors",
              mobileOpen
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200",
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? tCommon("closeMenu") : tCommon("openMenu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 py-5 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <LocaleSwitcher appearance="marketing" variant="grid" className="mb-5" />
          <nav className="flex flex-col gap-0.5" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-200/80 pt-5 dark:border-slate-800">
            <Button asChild variant="outline" className="h-11 w-full rounded-full">
              <Link href={isAuthed ? "/account" : "/login"}>
                {isAuthed ? tCommon("dashboard") : tCommon("logIn")}
              </Link>
            </Button>
            {!isAuthed ? (
              <Button
                asChild
                className="h-11 w-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-400 hover:to-cyan-500"
              >
                <Link href="/signup">{tCommon("getStartedFree")}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
