import Link from "next/link";
import {
  Building2,
  ArrowRight,
  Check,
  MapPin,
  BarChart3,
  Users,
  Settings,
  Shield,
  Zap,
  Globe,
  Clock,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Multi-Location Management | Restaurant Hub Solution",
  description: "Centralized management tools for restaurant groups. Control menus, pricing, and operations across all your locations.",
};

const features = [
  {
    icon: Globe,
    title: "Centralized Menu Management",
    description: "Update menus once and push to all locations or customize per-location as needed.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics Dashboard",
    description: "Real-time performance data across all locations in one comprehensive view.",
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    description: "Give managers access to their location while maintaining corporate oversight.",
  },
  {
    icon: Settings,
    title: "Standardized Operations",
    description: "Ensure consistent processes and quality standards across every location.",
  },
  {
    icon: Shield,
    title: "Compliance Management",
    description: "Track certifications, inspections, and regulatory requirements centrally.",
  },
  {
    icon: Zap,
    title: "Automated Reporting",
    description: "Scheduled reports delivered to stakeholders with the metrics that matter.",
  },
];

const benefits = [
  "Single dashboard for all locations",
  "Consistent brand experience",
  "Reduced administrative overhead",
  "Faster rollout of new items",
  "Better inventory visibility",
  "Simplified training",
];

const caseStudy = {
  name: "Urban Eats Group",
  locations: 12,
  results: [
    { metric: "40%", label: "Reduction in menu update time" },
    { metric: "25%", label: "Increase in operational efficiency" },
    { metric: "15%", label: "Lower food costs through bulk ordering" },
  ],
  quote: "Managing 12 locations used to mean chaos. Now everything is synchronized and our managers can focus on guests instead of admin work.",
  author: "Sarah Chen, COO",
};

const tiers = [
  {
    name: "Regional",
    locations: "2-5 locations",
    features: ["Centralized menus", "Basic analytics", "Email support"],
  },
  {
    name: "Enterprise",
    locations: "6-20 locations",
    features: ["Everything in Regional", "Advanced analytics", "API access", "Dedicated success manager"],
    highlighted: true,
  },
  {
    name: "Corporate",
    locations: "20+ locations",
    features: ["Everything in Enterprise", "Custom integrations", "On-site training", "SLA guarantee"],
  },
];

export default function MultiLocationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Building2 className="h-4 w-4" />
                Multi-Location
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                One platform for{" "}
                <span className="text-blue-600">all your locations</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Manage menus, track performance, and maintain brand consistency across your
                entire restaurant group from a single dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
                >
                  Schedule Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Location Overview</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {["Downtown", "Midtown", "Airport", "Mall Location"].map((location, i) => (
                    <div
                      key={location}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-slate-700">{location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        <span className="text-sm text-slate-500">{20 + i * 5} orders today</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-linear-to-r from-blue-500 to-blue-600 p-4 text-center text-white">
                  <p className="text-2xl font-bold">4 Locations</p>
                  <p className="text-sm text-blue-100">All synced in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Enterprise-grade{" "}
              <span className="text-blue-600">management tools</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Built for{" "}
                <span className="text-blue-600">scale</span>
              </h2>
              <p className="mt-4 text-slate-600">
                Whether you have 2 locations or 200, our platform grows with you.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{caseStudy.name}</p>
                  <p className="text-sm text-slate-500">{caseStudy.locations} locations</p>
                </div>
              </div>
              <div className="mb-6 grid grid-cols-3 gap-4">
                {caseStudy.results.map((result) => (
                  <div key={result.label} className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{result.metric}</p>
                    <p className="text-xs text-slate-500">{result.label}</p>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600">
                "{caseStudy.quote}"
              </blockquote>
              <p className="mt-4 text-sm font-medium text-slate-700">— {caseStudy.author}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Plans for every{" "}
              <span className="text-blue-600">size</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl border p-6 transition ${
                  tier.highlighted
                    ? "border-blue-300 bg-blue-50 shadow-lg"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                {tier.highlighted && (
                  <span className="mb-4 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{tier.locations}</p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`mt-6 block rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  Contact Sales
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-blue-600 to-blue-700 p-10 text-center text-white shadow-2xl shadow-blue-600/30 lg:p-16">
            <TrendingUp className="mx-auto mb-6 h-12 w-12 text-blue-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to unify your locations?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              See how our multi-location platform can streamline operations and improve
              consistency across your restaurant group.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Schedule Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/solutions/franchise"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Franchise Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
