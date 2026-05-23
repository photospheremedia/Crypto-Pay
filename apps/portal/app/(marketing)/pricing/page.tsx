import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Building2, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Restaurant Hub Solution",
  description: "Restaurant management software pricing. Basic ($99/mo), Pro ($199/mo), and Enterprise plans. Delivery integrations, supplies marketplace, and brand refresh services.",
  keywords: [
    "restaurant software pricing",
    "delivery integration pricing",
    "restaurant management cost",
    "Urban Piper alternative",
    "POS integration pricing",
  ],
  openGraph: {
    title: "Transparent Pricing for Restaurant Operations",
    description: "Basic ($99/mo), Pro ($199/mo), and Enterprise plans. Start with delivery integration, grow with supply marketplace and brand services.",
    url: "https://restauranthubsolution.com/pricing",
    type: "website",
    images: [
      {
        url: "/og-pricing.png",
        width: 1200,
        height: 630,
        alt: "Restaurant Hub Solution Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transparent Pricing for Restaurant Operations",
    description: "Basic ($99/mo), Pro ($199/mo), and Enterprise plans with no hidden fees.",
  },
};

const plans = [
  {
    name: "Basic",
    description: "Essential delivery integration for single-location restaurants.",
    price: "$99",
    period: "/mo per location",
    setupFee: "$199 one-time setup",
    icon: Zap,
    highlight: false,
    features: [
      "Delivery Integration (powered by Urban Piper)",
      "Connect up to 3 delivery platforms",
      "Single unified dashboard",
      "Basic menu sync",
      "POS order routing",
      "Email support (48hr response)",
      "Supply catalog access",
      "Monthly reports",
    ],
    cta: "Get Started",
    ctaLink: "/signup",
  },
  {
    name: "Pro",
    description: "Complete solution for growing multi-location restaurant groups.",
    price: "$199",
    period: "/mo per location",
    setupFee: "$299 one-time setup",
    icon: Building2,
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Basic, plus:",
      "Connect unlimited delivery platforms",
      "Advanced menu management",
      "Real-time inventory sync",
      "Kitchen display integration",
      "Analytics & business insights",
      "Priority support (24hr response)",
      "Dedicated success manager",
      "Bulk supply discounts",
      "Weekly performance reports",
      "Staff training included",
    ],
    cta: "Talk to Sales",
    ctaLink: "/contact",
  },
  {
    name: "Enterprise",
    description: "Custom solution for large chains with advanced needs.",
    price: "Custom",
    period: "contact for pricing",
    setupFee: "Custom setup & onboarding",
    icon: Rocket,
    highlight: false,
    features: [
      "Everything in Pro, plus:",
      "Unlimited locations & platforms",
      "White-label delivery integration",
      "Custom API development",
      "Multi-tenant management",
      "24/7 priority support",
      "Dedicated account team",
      "Custom SLAs & uptime guarantees",
      "On-site training & workshops",
      "Quarterly business reviews",
      "Early access to new features",
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
  },
];

const addOns = [
  {
    name: "Menu & Brand Refresh",
    price: "$499",
    period: "one-time per location",
    description: "Professional menu redesign, QR assets, and digital brand refresh.",
  },
  {
    name: "Website Optimization",
    price: "$999",
    period: "one-time",
    description: "Ordering funnel optimization, SEO setup, and conversion tracking.",
  },
  {
    name: "Packaging Design",
    price: "$299",
    period: "one-time",
    description: "Custom branded packaging and label design for delivery orders.",
  },
];

const faqs = [
  {
    q: "What's included in the Urban Piper integration?",
    a: "Our delivery integration (powered by Urban Piper) connects your restaurant to 15+ delivery platforms including Uber Eats, DoorDash, Grubhub, Postmates, and more. All orders appear in one unified dashboard, with automatic menu sync and real-time inventory updates.",
  },
  {
    q: "Are there any additional platform fees?",
    a: "No hidden fees. Monthly subscription covers delivery integration, POS routing, menu management, and support. You only pay delivery platform commissions (set by each platform) when customers order through them.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month with no long-term contracts. Cancel anytime with no penalties. Setup fees are non-refundable.",
  },
  {
    q: "Do you integrate with my POS system?",
    a: "Yes. We integrate with major POS systems including Toast, Square, Clover, and 20+ others. Orders route automatically from delivery platforms to your POS.",
  },
  {
    q: "How long does setup take?",
    a: "Most restaurants are live within 5-7 business days. We handle all technical setup, platform connections, menu configuration, and staff training.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards and ACH transfers. Enterprise customers can be invoiced monthly or quarterly.",
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
          Pricing
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">
          Simple, transparent pricing.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          All-in-one delivery integration powered by <strong className="text-slate-900">Urban Piper</strong>. No commissions, no hidden fees.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2">
          <span className="text-sm text-orange-700">💰</span>
          <p className="text-sm font-medium text-orange-700">
            Save an average of <strong>$16,000/year</strong> compared to third-party delivery commissions
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-6 ${
                plan.highlight
                  ? "border-orange-300 bg-orange-50/50 shadow-lg shadow-orange-100/50"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2 ${
                    plan.highlight ? "bg-orange-100" : "bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      plan.highlight ? "text-orange-500" : "text-slate-600"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500"> {plan.period}</span>
              </div>
              {plan.setupFee && (
                <p className="mt-2 text-xs text-slate-500">
                  + {plan.setupFee}
                </p>
              )}
              <Link
                href={plan.ctaLink}
                className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600"
                    : "border border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="mt-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
            Add-ons
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            Boost your brand presence.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            One-time services to elevate your restaurant&apos;s digital presence.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {addOns.map((addon) => (
            <div
              key={addon.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {addon.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{addon.description}</p>
              <div className="mt-4">
                <span className="text-xl font-bold text-slate-900">
                  {addon.price}
                </span>
                <span className="text-sm text-slate-500"> {addon.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
            Questions
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            Pricing FAQs
          </h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 rounded-3xl bg-linear-to-r from-orange-500 to-orange-600 p-10 text-center text-white">
        <h3 className="text-2xl font-semibold">Need a custom solution?</h3>
        <p className="mt-2 text-orange-100">
          Let&apos;s discuss your specific requirements and build a plan that
          works for your operation.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-white px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Talk to sales
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </section>
  );
}
