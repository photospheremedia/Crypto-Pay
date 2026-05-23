import type { Metadata } from "next";
import Link from "next/link";
import { Code2, KeyRound, TerminalSquare, Webhook } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Developers",
  description: "Build payment links, automate workflows, and monitor crypto payment events for business systems.",
};

const blocks = [
  {
    icon: KeyRound,
    title: "API keys",
    description: "Create scoped keys in your dashboard and keep environment separation clear.",
  },
  {
    icon: TerminalSquare,
    title: "Charge creation",
    description: "Generate payment requests from your backend with metadata for reconciliation.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Receive confirmation and settlement events to update your own systems.",
  },
  {
    icon: Code2,
    title: "Typed payloads",
    description: "Use predictable response and event structures for safer integrations.",
  },
];

const example = `POST /api/charges
{
  "amount": 84.50,
  "currency": "USD",
  "asset": "USDC",
  "reference": "table_7_ticket_10429"
}`;

export default function DevelopersPage() {
  return (
    <>
      <Section className="pb-8 pt-12">
        <SectionHeading
          eyebrow="Developers"
          title="Integrate Crypto Pay into your stack"
          description="From no-code payment links to backend-driven charge creation and webhooks for POS and ordering systems."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-3 w-fit rounded-xl bg-slate-100 p-2">
                <block.icon className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900">{block.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{block.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-100">
            <p className="mb-3 text-xs uppercase tracking-wide text-emerald-400">Quick start request</p>
            <pre className="overflow-x-auto text-sm leading-6">{example}</pre>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Need implementation help?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Share your checkout flow and we can help map charge creation, status handling, and webhook retries.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CtaButton href="/contact">Talk to support</CtaButton>
              <Link href="/signup" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
