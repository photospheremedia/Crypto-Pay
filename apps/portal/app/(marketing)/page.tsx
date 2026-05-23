import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Wallet, Zap, Layers } from "lucide-react";
import { BRAND } from "@/lib/cryptopay/constants";
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
    title: "Direct settlement",
    copy: "Payments settle directly to your wallet with no pooled account model.",
  },
  {
    icon: Wallet,
    title: "Clear payment flow",
    copy: "Create payment requests in seconds and track each transaction in one place.",
  },
  {
    icon: Zap,
    title: "Fast onboarding",
    copy: "Go live quickly with a setup flow built for business teams.",
  },
  {
    icon: Globe,
    title: "Global reach",
    copy: "Accept major cryptocurrencies from customers anywhere.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your wallet",
    copy: "Connect your wallet address and start receiving payments directly.",
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
  "Direct wallet settlement",
  "On-chain confirmation tracking",
  "Built for business teams",
  "Developer-friendly API",
];

export default function MarketingHome() {
  return (
    <>
      <Section className="pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
            {BRAND.name}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Accept crypto payments with confidence.
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">{BRAND.tagline}</p>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            Crypto Pay helps businesses accept Bitcoin and other cryptocurrencies with direct wallet
            settlement, clear status tracking, and operational visibility.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton href="/signup">Start Accepting Crypto</CtaButton>
            <CtaButton href="/how-it-works" variant="outline">
              See how it works
            </CtaButton>
          </div>
        </div>
      </Section>

      <Section className="bg-white/60 dark:bg-slate-900/40">
        <SectionHeading
          eyebrow="Why Crypto Pay"
          title="Built for speed, simplicity, and trust"
          description="Everything your business needs to accept crypto without giving up control of funds."
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
            “We switched to direct wallet payments and cut settlement confusion. Crypto Pay made
            the dashboard dead simple for our team.”
          </p>
          <footer className="mt-4 text-sm text-slate-500">— E-commerce operator, EU</footer>
        </blockquote>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to accept crypto payments?</h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-50">
            Launch quickly with transparent pricing and a setup designed for growing businesses.
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
