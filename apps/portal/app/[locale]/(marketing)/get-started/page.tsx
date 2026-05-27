import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import { createLocalizedMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const CHECKLIST_KEYS = ["1", "2", "3", "4", "5"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GetStartedPage.meta" });

  return createLocalizedMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/get-started",
  });
}

export default async function GetStartedPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "GetStartedPage" });

  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        />
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8">
          <ol className="space-y-4">
            {CHECKLIST_KEYS.map((key, idx) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-emerald-50 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("stepLabel", { step: idx + 1 })}
                  </p>
                  <p className="text-sm text-slate-700">{t(`checklist.${key}`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              {t("cta.createAccount")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("cta.talkToOnboarding")}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
