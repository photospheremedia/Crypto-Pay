import type { Metadata } from "next";
import Link from "next/link";
import { Check, Receipt, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Crypto Pay",
  description: "Straightforward pricing for businesses accepting crypto payments.",
};

const planCards = [
  {
    name: "Standard",
    icon: Receipt,
    price: "Transparent fee",
    subtitle: "per successful transaction",
    note: "No hidden platform charges",
    cta: "Get started",
    href: "/signup",
    highlight: true,
    features: [
      "Direct wallet settlement",
      "Crypto checkout links and invoices",
      "Real-time status tracking",
      "Core reporting and exports",
      "Email onboarding support",
    ],
  },
  {
    name: "Business Scale",
    icon: Building2,
    price: "Custom",
    subtitle: "volume-based pricing",
    note: "For multi-location operations",
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
    features: [
      "Everything in Standard",
      "Custom settlement and reporting",
      "Priority support and SLA options",
      "Dedicated integration support",
      "Enterprise security review",
    ],
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-24 lg:pt-28">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 font-display">
          Simple pricing for serious teams.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Start quickly with transparent transaction pricing, then move to custom commercial terms
          as your volume scales.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {planCards.map((plan) => {
          const Icon = plan.icon;
          return (
            <article
              key={plan.name}
              className={`rounded-3xl border p-6 ${
                plan.highlight
                  ? "border-orange-300 bg-orange-50/60 shadow-lg shadow-orange-100/60"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-bold text-slate-900">{plan.price}</p>
                <p className="text-sm text-slate-500">{plan.subtitle}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{plan.note}</p>
              </div>
              <Link
                href={plan.href}
                className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-gradient-to-r from-orange-500 to-emerald-600 text-white hover:from-orange-400 hover:to-emerald-500"
                    : "border border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="mt-16 rounded-3xl bg-gradient-to-r from-orange-500 to-emerald-600 p-10 text-center text-white">
        <h3 className="text-2xl font-semibold">Need a rollout plan for your locations?</h3>
        <p className="mt-2 text-orange-50">
          We can map wallet setup, team workflows, and settlement operations for your business.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-white px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Start accepting crypto
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}
