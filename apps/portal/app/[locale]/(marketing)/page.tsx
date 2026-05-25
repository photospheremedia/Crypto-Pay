import type { Metadata } from "next";
import { Code2, Layers, Shield, Wallet } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FeatureCard, StepCard } from "@/components/cryptopay/feature-card";
import { HomeHero } from "@/components/cryptopay/home-hero";
import { MarketingHighlights } from "@/components/cryptopay/marketing-highlights";
import {
  CtaButton,
  Section,
  SectionHeading,
} from "@/components/cryptopay/marketing-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MarketingHome({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const tCommon = await getTranslations("Common");

  const benefits = [
    {
      icon: Wallet,
      title: t("benefits.directSettlement.title"),
      copy: t("benefits.directSettlement.description"),
    },
    {
      icon: Shield,
      title: t("benefits.noChargebacks.title"),
      copy: t("benefits.noChargebacks.description"),
    },
    {
      icon: Layers,
      title: t("benefits.limitedKyc.title"),
      copy: t("benefits.limitedKyc.description"),
    },
    {
      icon: Code2,
      title: t("benefits.unifiedApi.title"),
      copy: t("benefits.unifiedApi.description"),
    },
  ];

  const steps = [
    {
      step: "01",
      title: t("steps.1.title"),
      copy: t("steps.1.description"),
    },
    {
      step: "02",
      title: t("steps.2.title"),
      copy: t("steps.2.description"),
    },
    {
      step: "03",
      title: t("steps.3.title"),
      copy: t("steps.3.description"),
    },
  ];

  return (
    <>
      <Section className="pb-8 pt-0">
        <HomeHero />
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow={t("highlightsEyebrow")}
          title={t("highlightsTitle")}
        />
        <MarketingHighlights />
      </Section>

      <Section>
        <SectionHeading
          eyebrow={t("howItWorksEyebrow")}
          title={t("howItWorksTitle")}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <StepCard
              key={s.step}
              step={s.step}
              title={s.title}
              description={s.copy}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          >
            {t("fullWalkthrough")}
          </Link>
        </div>
      </Section>

      <Section className="bg-white/60 dark:bg-slate-900/40">
        <SectionHeading
          eyebrow={t("whatYouGetEyebrow")}
          title={t("whatYouGetTitle")}
          description={t("whatYouGetDescription")}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <FeatureCard
              key={b.title}
              icon={b.icon}
              title={b.title}
              description={b.copy}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={t("integrationsEyebrow")}
          title={t("integrationsTitle")}
          description={t("integrationsDescription")}
        />
        <div className="flex flex-wrap justify-center gap-3">
          <CtaButton href="/developers" variant="outline">
            {t("apiCta")}
          </CtaButton>
          <CtaButton href="/pricing" variant="outline">
            {tCommon("viewPricing")}
          </CtaButton>
        </div>
      </Section>

      <Section className="bg-white/60 dark:bg-slate-900/40">
        <SectionHeading
          eyebrow={t("apiEyebrow")}
          title={t("apiTitle")}
          description={t("apiDescription")}
        />
        <div className="text-center">
          <CtaButton href="/developers">{t("apiCta")}</CtaButton>
        </div>
      </Section>

      <Section className="pb-24">
        <Card className="mx-auto max-w-2xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t("getStartedTitle")}</CardTitle>
            <CardDescription>{t("getStartedDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <CtaButton href="/signup">{tCommon("getStartedFree")}</CtaButton>
            <CtaButton href="/contact" variant="outline">
              {tCommon("talkToSales")}
            </CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
