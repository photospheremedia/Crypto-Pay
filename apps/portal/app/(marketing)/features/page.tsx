import type { Metadata } from "next";
import { CheckCheck, Globe, Shield, Wallet, Zap } from "lucide-react";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore core capabilities available in CryptivaPay for restaurant teams.",
};

const features = [
  {
    icon: Wallet,
    title: "Non-custodial wallet flow",
    description: "Funds settle directly to your wallet so you retain full control.",
  },
  {
    icon: Zap,
    title: "Real-time status tracking",
    description: "See pending and confirmed transactions for dine-in, pickup, and delivery orders.",
  },
  {
    icon: Globe,
    title: "Global payment support",
    description: "Accept major cryptocurrencies from local and international restaurant customers.",
  },
  {
    icon: Shield,
    title: "Operational safeguards",
    description: "Keep payment activity visible with clear event-driven status updates.",
  },
  {
    icon: CheckCheck,
    title: "Fast merchant onboarding",
    description: "Move from signup to first payment with a streamlined restaurant setup flow.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pb-8 pt-12">
        <SectionHeading
          eyebrow="Features"
          title="Tools built for practical crypto acceptance"
          description="Everything your restaurant team needs to collect, track, and reconcile crypto payments."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 w-fit rounded-xl bg-emerald-50 p-2">
                <feature.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-emerald-600 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">See the full workflow in action</h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
            Preview the dashboard, test payment creation, and launch quickly.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CtaButton href="/dashboard-preview">View dashboard preview</CtaButton>
            <CtaButton href="/signup" variant="outline">
              Start accepting crypto
            </CtaButton>
          </div>
        </div>
      </Section>
    </>
  );
}
