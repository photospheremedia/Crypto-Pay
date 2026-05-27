import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/json-ld";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPageMetadata } from "@/lib/site-metadata";
import { getFAQJsonLd } from "@/lib/json-ld";
import { buildLocalizedFaqs } from "@/lib/cryptopay/localized-faqs";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq.meta" });

  return createPageMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    path: "/faq",
    openGraphTitle: t("ogTitle"),
    openGraphDescription: t("ogDescription"),
  });
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Faq" });
  const { items, categories } = buildLocalizedFaqs(t);
  const faqJsonLd = getFAQJsonLd(
    items.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <Section belowHeader>
        <SectionHeading
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
        />
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`#${cat.id}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {cat.label}
            </Link>
          ))}
        </div>
        <FaqAccordion items={items} categories={categories} />
      </Section>

      <Section>
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t("cta.title")}</CardTitle>
            <CardDescription>{t("cta.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <CtaButton href="/contact">{t("cta.button")}</CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
