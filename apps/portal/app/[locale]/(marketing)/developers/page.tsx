import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Code2, KeyRound, TerminalSquare, Webhook } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Developers | Crypto Pay API",
  description:
    "One-stop unified API for crypto payments. Webhooks, payment links, and full control for your checkout.",
};

const blocks = [
  {
    icon: KeyRound,
    title: "API keys",
    description: "Scoped keys for test and production. Keep environments separate.",
  },
  {
    icon: TerminalSquare,
    title: "Create charges",
    description:
      "Generate payment requests from your backend with amount, asset, and metadata for reconciliation.",
  },
  {
    icon: Webhook,
    title: "Callbacks & webhooks",
    description:
      "HTTP callbacks when status changes — unpaid, in process, paid. Mark orders fulfilled when confirmed.",
  },
  {
    icon: Code2,
    title: "Unified API",
    description:
      "Full control with documented endpoints. Fast, reliable — built for custom sites and apps.",
  },
];

const example = `POST /api/charges
{
  "amount": 84.50,
  "currency": "USD",
  "asset": "USDC",
  "reference": "order_10429"
}`;

export default function DevelopersPage() {
  return (
    <>
      <Section className="pb-8 pt-12">
        <SectionHeading
          eyebrow="Developers"
          title="One-stop unified API for BTC, ETH, USDT & more"
          description="Have full control with the Crypto Pay API. Documentation, webhooks, and support for custom checkout flows."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map((block) => (
            <article
              key={block.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 w-fit rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/50">
                <block.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{block.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0 pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-100">
            <p className="mb-3 text-xs uppercase tracking-wide text-emerald-400">
              Quick start
            </p>
            <pre className="overflow-x-auto text-sm leading-6">{example}</pre>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ready to integrate?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create an account, connect a wallet, and start testing charges. Need help mapping
              callbacks? Talk to us.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CtaButton href="/signup">Get started for free</CtaButton>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
