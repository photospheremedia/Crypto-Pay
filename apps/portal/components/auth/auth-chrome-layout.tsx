import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { mainBelowHeaderClass } from "@/lib/layout-spacing";

type AuthChromeLayoutProps = {
  children: React.ReactNode;
  variant?: "minimal" | "marketing";
};

export async function AuthChromeLayout({
  children,
  variant = "minimal",
}: AuthChromeLayoutProps) {
  const t = await getTranslations("Auth.layout");
  const tNav = await getTranslations("Navigation");

  if (variant === "marketing") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-slate-50 text-slate-900">
        <header className="sticky left-0 right-0 top-0 z-30 border-b border-white/70 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
            <Logo size="md" showText={true} />
            <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <Link href="/how-it-works" className="transition hover:text-emerald-600">
                {tNav("howItWorks")}
              </Link>
              <Link href="/pricing" className="transition hover:text-emerald-600">
                {tNav("pricing")}
              </Link>
              <Link href="/developers" className="transition hover:text-emerald-600">
                {tNav("developers")}
              </Link>
              <Link href="/contact" className="transition hover:text-emerald-600">
                {tNav("contact")}
              </Link>
            </nav>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("backToHome")}</span>
            </Link>
          </div>
        </header>
        <main className={mainBelowHeaderClass}>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="md" showText={true} />
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          >
            ← {t("backToSite")}
          </Link>
        </div>
      </header>
      <main className={mainBelowHeaderClass}>{children}</main>
    </div>
  );
}
