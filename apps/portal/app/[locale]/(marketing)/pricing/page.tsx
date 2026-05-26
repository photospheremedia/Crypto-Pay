import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Check, Receipt, Building2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRICING } from "@/lib/cryptopay/constants";
import { createLocalizedMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });

  return createLocalizedMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/pricing",
    openGraphTitle: t("ogTitle"),
    openGraphDescription: t("ogDescription"),
  });
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Pricing");
  const tCommon = await getTranslations("Common");

  const planCards = [
    {
      name: PRICING.standard.planName,
      icon: Receipt,
      price: `${PRICING.standard.baseFeePercent}%`,
      subtitle: t("standard.subtitle"),
      note: t("standard.note"),
      cta: tCommon("getStarted"),
      href: "/signup",
      highlight: true,
      features: [
        t("standard.features.directSettlement"),
        t("standard.features.checkoutLinks"),
        t("standard.features.statusTracking"),
        t("standard.features.reporting"),
        t("standard.features.support"),
      ],
    },
    {
      name: t("business.name"),
      icon: Building2,
      price: t("business.price"),
      subtitle: t("business.subtitle"),
      note: t("business.note"),
      cta: tCommon("talkToSales"),
      href: "/contact",
      highlight: false,
      features: [
        t("business.features.everythingStandard"),
        t("business.features.customReporting"),
        t("business.features.prioritySupport"),
        t("business.features.integrationSupport"),
        t("business.features.securityReview"),
      ],
    },
  ] as const;

  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {planCards.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={
                  plan.highlight
                    ? "border-emerald-300 bg-emerald-50/60 shadow-lg shadow-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                      <Icon className="size-5 text-emerald-600" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="pt-2">
                    <span className="block text-4xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="mt-1 block text-sm">{plan.subtitle}</span>
                    <span className="mt-1 block text-xs uppercase tracking-wide">{plan.note}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={
                      plan.highlight
                        ? "w-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500"
                        : "w-full rounded-full"
                    }
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t("multiLocationTitle")}</CardTitle>
            <CardDescription>{t("multiLocationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <Button asChild className="rounded-full">
              <Link href="/contact">{t("contactSales")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/signup">{t("createAccount")}</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
