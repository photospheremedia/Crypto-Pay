import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageShell } from "@/components/cryptopay/marketing-section";
import { createPageMetadata } from "@/lib/site-metadata";
import { Heart, Rocket, Shield, Target, TrendingUp, Users } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage.meta" });

  return createPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/about",
    openGraphTitle: t("ogTitle"),
    openGraphDescription: t("ogDescription"),
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "AboutPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const stats = [
    { icon: Target, key: "merchants" as const },
    { icon: Heart, key: "uptime" as const },
    { icon: TrendingUp, key: "setup" as const },
    { icon: Shield, key: "assets" as const },
  ];

  const values = [
    { icon: Users, key: "merchantFirst" as const },
    { icon: Shield, key: "privacy" as const },
    { icon: Rocket, key: "developerReady" as const },
  ];

  const milestones = [
    { key: "2024Launch" as const },
    { key: "2025Runner" as const },
    { key: "2026Checkout" as const },
  ];

  return (
    <MarketingPageShell>
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{t("hero.description")}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="group rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-emerald-600"
            >
              {t("hero.bookDemo")}
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              {t("hero.contactSales")}
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-linear-to-br from-emerald-50 to-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {t("mission.title")}
          </p>
          <p className="mt-4 text-lg text-slate-700">{t("mission.body")}</p>
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-emerald-100/50 p-4">
            <Rocket className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-800">{t("mission.tagline")}</p>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
            >
              <Icon className="h-6 w-6 text-emerald-500 transition group-hover:scale-110" />
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {t(`stats.${stat.key}.value`)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t(`stats.${stat.key}.label`)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            {t("values.title")}
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            {t("values.subtitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.key}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="inline-flex rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-200">
                  <Icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {t(`values.${value.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {t(`values.${value.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            {t("milestones.title")}
          </p>
        </div>
        <div className="relative mt-10">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-emerald-100 md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.key}
                className={`relative flex items-start gap-6 md:gap-10 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden w-1/2 md:block" />
                <div className="absolute left-4 top-1 h-3 w-3 rounded-full bg-emerald-500 md:left-1/2 md:-translate-x-1/2" />
                <div className="ml-10 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:ml-0 md:w-1/2">
                  <p className="text-xs font-semibold text-emerald-500">
                    {t(`milestones.${milestone.key}.year`)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {t(`milestones.${milestone.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {t(`milestones.${milestone.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 overflow-hidden rounded-[28px] bg-linear-to-r from-emerald-500 to-cyan-600 p-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              {t("cta.title")}
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold">{t("cta.description")}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
            >
              {tCommon("getStarted")}
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("cta.contact")}
            </Link>
          </div>
        </div>
      </div>
    </MarketingPageShell>
  );
}
