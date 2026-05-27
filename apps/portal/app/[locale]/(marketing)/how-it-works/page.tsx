import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Link2, Radio, ShieldCheck, Wallet } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createLocalizedMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HowItWorksPage.meta" });

  return createLocalizedMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/how-it-works",
  });
}

export default async function HowItWorksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "HowItWorksPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const steps = [
    { icon: Wallet, key: "connectWallet" as const },
    { icon: Link2, key: "createPayment" as const },
    { icon: Radio, key: "customerPays" as const },
    { icon: CheckCircle2, key: "confirmationCallback" as const },
    { icon: ShieldCheck, key: "reconcileExport" as const },
  ];

  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/50">
                  <step.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600">
                  {t("stepLabel", { step: index + 1 })}
                </p>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t(`steps.${step.key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t("cta.title")}</CardTitle>
            <CardDescription>{t("cta.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <CtaButton href="/signup">{tCommon("getStartedFree")}</CtaButton>
            <CtaButton href="/developers" variant="outline">
              {t("cta.apiDocs")}
            </CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
