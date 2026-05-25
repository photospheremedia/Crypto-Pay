import type { Metadata } from "next";
import Link from "next/link";
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
import { getFAQJsonLd } from "@/lib/json-ld";
import { CRYPTO_FAQS, FAQ_CATEGORIES } from "@/lib/cryptopay/faqs";

export const metadata: Metadata = {
  title: "FAQ | Crypto Pay",
  description:
    "Frequently asked questions about Crypto Pay — wallet settlement, supported assets, pricing, and API integration.",
  openGraph: {
    title: "Crypto Pay — Frequently Asked Questions",
    description: "Answers to common questions about accepting crypto payments with Crypto Pay.",
    url: "https://cryptopay.sale/faq",
    type: "website",
  },
};

export default function FaqPage() {
  const faqJsonLd = getFAQJsonLd(
    CRYPTO_FAQS.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <Section className="pb-8 pt-0">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers for operators and owners"
          description="If you have a unique workflow, reach out and we'll design a plan for you."
        />
        <div className="flex flex-wrap justify-center gap-2">
          {FAQ_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {cat}
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <FaqAccordion items={CRYPTO_FAQS} categories={[...FAQ_CATEGORIES]} />
      </Section>

      <Section className="pb-24 pt-0">
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
            <CardDescription>Contact us and we will help with your setup.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <CtaButton href="/contact">Contact</CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
