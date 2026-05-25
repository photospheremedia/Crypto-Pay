import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Shield } from "lucide-react";
import { FeatureCard, StepCard } from "@/components/cryptopay/feature-card";
import { HomeHero } from "@/components/cryptopay/home-hero";
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
import { BRAND } from "@/lib/cryptopay/constants";

export const metadata: Metadata = {
  title: "Accept Crypto Payments Instantly",
  description: BRAND.tagline,
};

const benefits = [
  {
    icon: Layers,
    title: "Direct settlement",
    copy: "Payments go to your wallet address. We do not hold merchant funds.",
  },
  {
    icon: Shield,
    title: "Forget about chargebacks",
    copy: "Cryptocurrency transactions are irreversible.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    copy: "Add the wallet address where you want to receive payments.",
  },
  {
    step: "02",
    title: "Create a payment request",
    copy: "Set the amount, asset, and optional reference for your records.",
  },
  {
    step: "03",
    title: "Customer pays on-chain",
    copy: "We match the incoming transaction and update the payment status.",
  },
];

export default function MarketingHome() {
  return (
    <>
      <Section className="pb-8 pt-12 sm:pt-16">
        <HomeHero />
      </Section>

      <Section>
        <SectionHeading eyebrow="How it works" title="Three steps" />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <StepCard key={s.step} step={s.step} title={s.title} description={s.copy} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          >
            Full walkthrough →
          </Link>
        </div>
      </Section>

      <Section className="bg-white/60 dark:bg-slate-900/40">
        <SectionHeading
          eyebrow="What you get"
          title="Core features"
          description="Straightforward tools for accepting crypto — no extra platform layers."
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((b) => (
            <FeatureCard key={b.title} icon={b.icon} title={b.title} description={b.copy} />
          ))}
        </div>
      </Section>

      <Section className="pb-24">
        <Card className="mx-auto max-w-2xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Create an account, connect a wallet, and create your first payment link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <CtaButton href="/signup">Create account</CtaButton>
            <CtaButton href="/pricing" variant="outline">
              View pricing
            </CtaButton>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
