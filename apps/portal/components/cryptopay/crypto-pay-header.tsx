"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClientOptional } from "@crypto-pay/db/supabaseClient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/cryptopay/constants";
import { siteHeaderStackClass } from "@/lib/layout-spacing";
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
    <header
      className={cn(
        siteHeaderStackClass,
        "border-b border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <CryptoPayLogo />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("mainNavAria")}>
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

        <div className="relative z-[110] hidden items-center gap-1.5 md:flex">
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
            className="rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label={tCommon("openMenu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="gap-2 border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
                <SheetTitle className="sr-only">{tCommon("openMenu")}</SheetTitle>
                <div className="flex items-center justify-between gap-3">
                  <CryptoPayLogo />
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-4 px-4 py-5">
                <LocaleSwitcher appearance="marketing" variant="select" className="w-full" />

                <Separator />

                <nav className="flex flex-col gap-1" aria-label={t("mainNavAria")}>
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

                <Separator />

                <div className="flex flex-col gap-2">
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
