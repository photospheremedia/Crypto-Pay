"use client";

import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

/**
 * Benefits Section - Instead of generic features
 * Organized by what users GAIN, not what we BUILT
 */
export function BenefitsSection() {
  const benefits = [
    {
      category: "💰 Revenue Impact",
      title: "Save $18,000/year in commission fees",
      description: "Consolidate delivery apps and drive direct orders to keep 100% of revenue instead of paying 15-30% commissions.",
      metrics: [
        { label: "Average annual savings", value: "$18K" },
        { label: "Sales increase", value: "+35%" },
        { label: "Direct order ratio", value: "60%+" },
      ],
      cta: "See case studies",
      href: "#case-studies"
    },
    {
      category: "⚡ Operational Efficiency",
      title: "Reduce operational friction by 40%",
      description: "Stop manually syncing menus, handling multiple tablets, and managing vendor relationships. One unified dashboard for everything.",
      metrics: [
        { label: "Time saved per week", value: "8-12 hours" },
        { label: "Manual tasks eliminated", value: "60%" },
        { label: "Error reduction", value: "95%" },
      ],
      cta: "Explore features",
      href: "/technology"
    },
    {
      category: "🛡️ Peace of Mind",
      title: "24/7 expert support & fraud protection",
      description: "Dedicated team available round-the-clock. 100% chargeback protection, PCI compliance, and regulatory guidance included.",
      metrics: [
        { label: "Response time", value: "<5 minutes" },
        { label: "Uptime SLA", value: "99.9%" },
        { label: "Chargeback protection", value: "100%" },
      ],
      cta: "Learn about support",
      href: "/services/support"
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-orange-600 font-semibold mb-4">
            Why restaurants switch to Crypto Pay
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            The real results that matter
          </h2>
          <p className="text-lg text-slate-600">
            Not just features—tangible improvements to your bottom line and peace of mind
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 p-8 hover:border-orange-300 hover:shadow-lg transition-all bg-linear-to-br from-slate-50 to-white"
            >
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-orange-100 mb-4">
                <p className="text-sm font-semibold text-orange-700">{benefit.category}</p>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6">
                {benefit.description}
              </p>

              {/* Metrics */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                {benefit.metrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{metric.label}</span>
                    <span className="font-bold text-lg text-orange-600">{metric.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={benefit.href}
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm"
              >
                {benefit.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-linear-to-r from-orange-500/10 via-transparent to-orange-500/10 rounded-2xl border border-orange-200/50 p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to transform your restaurant?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join 1,200+ restaurants that are saving money, reducing stress, and growing faster with Crypto Pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              Book a Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-lg font-semibold transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
