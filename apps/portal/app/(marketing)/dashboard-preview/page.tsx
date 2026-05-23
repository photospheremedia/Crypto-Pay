import type { Metadata } from "next";
import { BarChart3, Bell, Wallet } from "lucide-react";
import { CryptoConverter } from "@/components/cryptopay/crypto-converter";
import { DashboardMock } from "@/components/cryptopay/dashboard-mock";
import { CtaButton, Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Dashboard Preview",
  description: "Explore the transaction, balance, and live conversion view merchants see in CryptivaPay.",
};

const highlights = [
  {
    icon: Wallet,
    title: "Wallet balances",
    description: "Track asset balances across your connected wallets in one place.",
  },
  {
    icon: Bell,
    title: "Payment status alerts",
    description: "Spot pending, confirmed, and failed transactions quickly.",
  },
  {
    icon: BarChart3,
    title: "Operational reporting",
    description: "Understand payment volume and settlement trends over time.",
  },
];

export default function DashboardPreviewPage() {
  return (
    <>
      <Section className="pb-10 pt-12">
        <SectionHeading
          eyebrow="Preview"
          title="A cleaner view of crypto payment operations"
          description="See the same dashboard layout used to monitor transactions, statuses, and balances."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 sm:p-8">
            <DashboardMock />
          </div>
          <CryptoConverter />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 w-fit rounded-lg bg-emerald-50 p-2">
                <highlight.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{highlight.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{highlight.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-emerald-600 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">See it with your own data</h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
            Create your account and connect your first wallet to unlock the full dashboard.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CtaButton href="/signup">Start Accepting Crypto</CtaButton>
            <CtaButton href="/developers" variant="outline">
              Developer docs
            </CtaButton>
          </div>
        </div>
      </Section>
    </>
  );
}
