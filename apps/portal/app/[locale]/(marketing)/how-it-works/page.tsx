import type { Metadata } from "next";
import { CheckCircle2, Link2, Radio, ShieldCheck, Wallet } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How Crypto Pay Works",
  description:
    "Non-custodial crypto checkout: wallet to wallet, on-chain confirmation tracking, and webhooks.",
};

const steps = [
  {
    icon: Wallet,
    title: "Connect your wallet",
    description:
      "Add the public address where you want to receive payments. No private keys — wallet to wallet.",
  },
  {
    icon: Link2,
    title: "Create a payment request",
    description:
      "Set amount and coin. Share a payment link or create a charge via API with your order reference.",
  },
  {
    icon: Radio,
    title: "Customer pays on-chain",
    description:
      "Checkout can stay on your site. We detect the transaction and move status to in process.",
  },
  {
    icon: CheckCircle2,
    title: "Confirmation & callback",
    description:
      "When the payment is confirmed on-chain, status becomes paid and your webhook or dashboard updates.",
  },
  {
    icon: ShieldCheck,
    title: "Reconcile & export",
    description:
      "Review payment history in your account and export records for accounting.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow="How it works"
          title="Track and accept crypto payments"
          description="Privacy oriented. Wallet to wallet. From first link to confirmed payment."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/50">
                  <step.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600">
                  STEP {index + 1}
                </p>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>Ready to get started?</CardTitle>
            <CardDescription>
              Join now for smooth, quick crypto checkout — set up in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <CtaButton href="/signup">Get started for free</CtaButton>
            <CtaButton href="/developers" variant="outline">
              API docs
            </CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
