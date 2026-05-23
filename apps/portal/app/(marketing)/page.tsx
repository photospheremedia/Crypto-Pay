import type { Metadata } from "next";
import Link from "next/link";
import {
  Bitcoin,
  Globe,
  Lock,
  Shield,
  Wallet,
  Zap,
  Layers,
  Code2,
} from "lucide-react";
import { BRAND } from "@/lib/cryptopay/constants";
import { CryptoConverter } from "@/components/cryptopay/crypto-converter";
import { DashboardMock } from "@/components/cryptopay/dashboard-mock";
import {
  CtaButton,
  Section,
  SectionHeading,
} from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Accept Crypto Payments Instantly",
  description: BRAND.tagline,
};

const benefits = [
  {
    icon: Layers,
    title: "No middlemen",
    copy: "Payments go wallet-to-wallet. You stay in control of your funds.",
  },
  {
    icon: Wallet,
    title: "Direct wallet payments",
    copy: "Customers pay your address. Settlements land in your wallet, not a pooled account.",
  },
  {
    icon: Zap,
    title: "2% business trial",
    copy: "Start with a clear 2% trial fee while your restaurant team validates fit.",
  },
  {
    icon: Globe,
    title: "Easy setup",
    copy: "Connect a wallet, create payment links, and start accepting crypto in minutes.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    copy: "Link a non-custodial wallet. Crypto Pay never holds your private keys.",
  },
  {
    step: "02",
    title: "Generate payment requests",
    copy: "Create invoices, buttons, or API charges with fixed crypto amounts.",
  },
  {
    step: "03",
    title: "Receive crypto directly",
    copy: "Track confirmations on-chain and see fiat equivalents in real time.",
  },
];

const trust = [
  "Non-custodial by design",
  "On-chain confirmation tracking",
  "Built for restaurant operators",
  "Developer-friendly API",
];

export default function MarketingHome() {
  return (
    <>
      <Section className="pb-8 pt-12 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
              {BRAND.name}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Accept crypto payments.{" "}
              <span className="bg-gradient-to-r from-orange-500 to-emerald-600 bg-clip-text text-transparent">
                Instantly.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">{BRAND.tagline}</p>
            <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">
              CryptivaPay helps restaurants accept Bitcoin and other cryptocurrencies with direct,
              non-custodial wallet payments for dine-in, pickup, and online checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <CtaButton />
              <CtaButton href="/dashboard-preview" variant="outline">
                View dashboard preview
              </CtaButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              {[Bitcoin, Shield, Lock].map((Icon, i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <CryptoConverter />
            <DashboardMock className="hidden sm:block" />
          </div>
        </div>
      </Section>

      <Section className="bg-white/60 dark:bg-slate-900/40">
        <SectionHeading
          eyebrow="Why CryptivaPay"
          title="Built for speed, simplicity, and trust"
          description="Everything your restaurant needs to accept crypto without giving up control of funds."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
            >
              <b.icon className="h-8 w-8 text-emerald-600 transition group-hover:scale-110" />
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{b.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{b.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to your first payment"
        />
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-slate-200 p-8 dark:border-slate-800">
              <span className="text-4xl font-bold text-emerald-500/30">{s.step}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{s.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/how-it-works"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
          >
            See the full walkthrough →
          </Link>
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Dashboard"
              title="See every payment at a glance"
              description="Monitor transactions, statuses, and balances in one clean interface."
              center={false}
            />
            <ul className="space-y-3 text-slate-300">
              <li>• Live transaction list with confirmation status</li>
              <li>• Wallet balance overview across assets</li>
              <li>• Built-in crypto-to-fiat converter for menu pricing</li>
            </ul>
            <div className="mt-8">
              <CtaButton href="/dashboard-preview" variant="outline">
                Explore preview
              </CtaButton>
            </div>
          </div>
          <DashboardMock />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Trusted"
          title="Merchants choose clarity over complexity"
        />
        <div className="flex flex-wrap justify-center gap-3">
          {trust.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
        <blockquote className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            “We switched to direct wallet payments and cut settlement confusion. CryptivaPay made
            the dashboard dead simple for our team.”
          </p>
          <footer className="mt-4 text-sm text-slate-500">— E-commerce operator, EU</footer>
        </blockquote>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to accept crypto?</h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-50">
            Start your business trial today at 2% per transaction. No free starter pack, no hidden
            platform costs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
