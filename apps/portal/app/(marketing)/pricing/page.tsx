import type { Metadata } from "next";
import Link from "next/link";
import { Check, Percent, Store, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | CryptivaPay",
  description:
    "Restaurant-friendly crypto payment pricing with a 2% business trial and custom scale plans.",
};

const planCards = [
  {
    name: "Business Trial",
    icon: Percent,
    price: "2%",
    subtitle: "per successful transaction",
    note: "No free starter pack",
    cta: "Start business trial",
    href: "/signup",
    highlight: true,
    features: [
      "Direct non-custodial wallet payments",
      "Crypto checkout links and invoices",
      "Real-time status tracking",
      "Live crypto-to-fiat converter",
      "Email support for onboarding",
    ],
  },
  {
    name: "Restaurant Scale",
    icon: Building2,
    price: "Custom",
    subtitle: "volume-based pricing",
    note: "For multi-location operations",
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
    features: [
      "Everything in Business Trial",
      "Custom settlement and reporting",
      "Priority support and SLA options",
      "Dedicated integration support",
      "Enterprise security review",
    ],
  },
];

const comparison = [
  { feature: "Direct wallet settlement", trial: true, scale: true },
  { feature: "Checkout links and invoices", trial: true, scale: true },
  { feature: "Dashboard + status tracking", trial: true, scale: true },
  { feature: "Real-time converter widget", trial: true, scale: true },
  { feature: "Priority support", trial: false, scale: true },
  { feature: "Custom SLA / compliance support", trial: false, scale: true },
];

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-24 lg:pt-28">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900 font-display">
          Built for restaurant operators.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Start with a simple <strong className="text-slate-900">2% business trial</strong>, then
          move to custom volume pricing as your crypto payment volume grows.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2">
          <Store className="h-4 w-4 text-orange-600" />
          <p className="text-sm font-medium text-orange-700">
            No free starter pack. Straightforward commercial pricing from day one.
          </p>
        </div>
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

      <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-2xl font-semibold text-slate-900">Plan comparison</h3>
        <p className="mt-2 text-sm text-slate-600">
          Simple feature coverage across trial and scale plans.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-3 font-semibold text-slate-900">Feature</th>
                <th className="px-3 py-3 font-semibold text-slate-900">Business Trial (2%)</th>
                <th className="px-3 py-3 font-semibold text-slate-900">Restaurant Scale</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-700">{row.feature}</td>
                  <td className="px-3 py-3 text-slate-700">{row.trial ? "Included" : "—"}</td>
                  <td className="px-3 py-3 text-slate-700">{row.scale ? "Included" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-gradient-to-r from-orange-500 to-emerald-600 p-10 text-center text-white">
        <h3 className="text-2xl font-semibold">Need a rollout plan for your locations?</h3>
        <p className="mt-2 text-orange-50">
          We can map wallet setup, team workflows, and settlement operations for your restaurant
          business.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-white px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Start 2% business trial
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
