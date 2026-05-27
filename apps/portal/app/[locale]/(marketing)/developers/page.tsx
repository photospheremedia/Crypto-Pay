import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CircleHelp, ShieldCheck, Wallet } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import { createLocalizedMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DevelopersPage.meta" });

  return createLocalizedMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/developers",
  });
}

export default async function DevelopersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "DevelopersPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const blocks = [
    { icon: ShieldCheck, key: "security" as const },
    { icon: Wallet, key: "walletVerification" as const },
    { icon: CircleHelp, key: "gettingStarted" as const },
  ];

  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map((block) => (
            <article
              key={block.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 w-fit rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/50">
                <block.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t(`blocks.${block.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t(`blocks.${block.key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-100">
            <p className="mb-3 text-xs uppercase tracking-wide text-emerald-400">
              {t("quickStart.eyebrow")}
            </p>
            <p className="text-sm leading-6 text-slate-200">{t("quickStart.description")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                {t("quickStart.howItWorks")}
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                {t("quickStart.getStarted")}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("cta.title")}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("cta.description")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CtaButton href="/signup">{tCommon("getStartedFree")}</CtaButton>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                {tCommon("talkToSales")}
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
