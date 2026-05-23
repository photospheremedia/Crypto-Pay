import type { Metadata } from "next";
import { CheckCircle2, Link2, ShieldCheck, Wallet } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "How Crypto Pay Works",
  description: "A simple walkthrough of setup, payment collection, and confirmation tracking.",
};

const steps = [
  {
    icon: Wallet,
    title: "Connect your wallet",
    description: "Use your existing wallet address so settlement goes directly to your wallet.",
  },
  {
    icon: Link2,
    title: "Create payment links or invoices",
    description: "Generate payment requests with amount, asset, and optional order table or ticket reference.",
  },
  {
    icon: CheckCircle2,
    title: "Track confirmations in real time",
    description: "Watch transactions settle on-chain with a clear status view for your team.",
  },
  {
    icon: ShieldCheck,
    title: "Reconcile and export",
    description: "Review transaction history and export records for accounting and business operations.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pb-8 pt-12">
        <SectionHeading
          eyebrow="How It Works"
          title="From setup to settlement in minutes"
          description="Crypto Pay makes crypto acceptance practical for daily business operations."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <step.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600">STEP {index + 1}</p>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-emerald-600 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to process your first payment?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
            Create an account, connect a wallet, and start accepting crypto without platform lock-in.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CtaButton href="/signup">Start Accepting Crypto</CtaButton>
            <CtaButton href="/developers" variant="outline">
              View API docs
            </CtaButton>
          </div>
        </div>
      </Section>
    </>
  );
}
