"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      category: "💰 Zero Fees",
      title: "Keep 100% of every payment",
      description:
        "No middlemen, no chargebacks, no processing fees. Funds go directly wallet-to-wallet the moment a customer pays.",
      metrics: [
        { label: "Processing fee", value: "0%" },
        { label: "Settlement time", value: "Instant" },
        { label: "Chargeback risk", value: "None" },
      ],
      cta: "See pricing",
      href: "/pricing",
    },
    {
      category: "⚡ Global Reach",
      title: "Accept payments from anywhere",
      description:
        "BTC, ETH, USDT, USDC and more. Any customer, any country, any device — no bank account required.",
      metrics: [
        { label: "Supported coins", value: "10+" },
        { label: "Countries", value: "195+" },
        { label: "Integration time", value: "<1 hour" },
      ],
      cta: "View integrations",
      href: "/developers",
    },
    {
      category: "🛡️ Non-Custodial",
      title: "Your keys, your funds",
      description:
        "We never hold your money. Payments land directly in your wallet. Full control, maximum security.",
      metrics: [
        { label: "Custody", value: "None" },
        { label: "Uptime SLA", value: "99.9%" },
        { label: "Open source SDK", value: "Yes" },
      ],
      cta: "How it works",
      href: "/how-it-works",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold mb-4">
            Why merchants choose Crypto Pay
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Real advantages, not buzzwords
          </h2>
          <p className="text-lg text-slate-600">
            Built for businesses that want to accept crypto without the complexity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 p-8 hover:border-emerald-300 hover:shadow-lg transition-all bg-linear-to-br from-slate-50 to-white"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 mb-4">
                <p className="text-sm font-semibold text-emerald-700">{benefit.category}</p>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600 mb-6">{benefit.description}</p>
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                {benefit.metrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{metric.label}</span>
                    <span className="font-bold text-lg text-emerald-600">{metric.value}</span>
                  </div>
                ))}
              </div>
              <Link
                href={benefit.href}
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
              >
                {benefit.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-linear-to-r from-emerald-500/10 via-transparent to-emerald-500/10 rounded-2xl border border-emerald-200/50 p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to accept crypto payments?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Set up in minutes. No coding required. Start receiving payments globally today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-lg font-semibold transition"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
