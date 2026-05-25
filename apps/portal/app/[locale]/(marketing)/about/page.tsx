import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/cryptopay/marketing-section";
import {
  Users,
  Target,
  Rocket,
  Heart,
  TrendingUp,
  Clock,
  Shield,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | Crypto Pay",
  description: "Learn about Crypto Pay. A team of business operators, technologists, and supply chain experts building tools to simplify business operations.",
  keywords: [
    "about business hub",
    "our story",
    "business operations company",
    "business technology team",
  ],
  openGraph: {
    title: "Our Story: Crypto Pay",
    description: "Built by business operators for business operators. Simplifying delivery, supply, and brand management.",
    url: "https://cryptopay.sale/about",
    type: "website",
  },
};

const values = [
  {
    title: "Operator-first",
    copy: "We build tools and playbooks that reduce chaos for GMs and kitchen teams.",
    icon: Users,
  },
  {
    title: "Revenue-minded",
    copy: "Every rollout is tied to conversion, reorder rate, and delivery margin.",
    icon: TrendingUp,
  },
  {
    title: "Supplier aware",
    copy: "We package supplies and packaging with realistic lead times and pricing.",
    icon: Shield,
  },
];

const stats = [
  { value: "150+", label: "Locations served", icon: Target },
  { value: "98%", label: "Client retention", icon: Heart },
  { value: "14 days", label: "Avg onboarding", icon: Clock },
  { value: "$2M+", label: "Supplies shipped", icon: Award },
];

const milestones = [
  {
    year: "2024",
    title: "Founded",
    description:
      "Started with a focus on delivery platform consolidation for multi-location groups.",
  },
  {
    year: "2024",
    title: "Supply marketplace",
    description:
      "Launched curated supply catalog with reseller pricing and fulfillment tracking.",
  },
  {
    year: "2025",
    title: "100+ locations",
    description:
      "Reached milestone of 100 business locations actively using our platform.",
  },
  {
    year: "2026",
    title: "Enterprise expansion",
    description:
      "Expanding to serve larger business groups with custom integrations and SLAs.",
  },
];

export default function AboutPage() {
  return (
    <MarketingPageShell>
      {/* Hero */}
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
            About us
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
            We help businesses scale without vendor overload.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Crypto Pay is built for business groups juggling
            delivery platforms, menu changes, and supply costs. We combine
            delivery platform integration, marketing upgrades, and curated
            product resale to keep everything in one operational hub.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="group rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-emerald-600"
            >
              Book a demo
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Contact sales
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-linear-to-br from-emerald-50 to-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Our mission
          </p>
          <p className="mt-4 text-lg text-slate-700">
            Build a single control plane for business ops: delivery
            integrations, marketing performance, and supply workflows — all in
            one place.
          </p>
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-emerald-100/50 p-4">
            <Rocket className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-800">
              Serving multi-location business groups and fast-growing
              independents.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
            >
              <Icon className="h-6 w-6 text-emerald-500 transition group-hover:scale-110" />
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Images */}
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          "/images/hero-dashboard.svg",
          "/images/supply-grid.svg",
          "/images/branding-refresh.svg",
        ].map((src, index) => (
          <div
            key={src}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <img
              src={src}
              alt={`Operations preview ${index + 1}`}
              className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-105 md:aspect-16/10"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            Our values
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            What drives us every day.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="inline-flex rounded-2xl bg-emerald-100 p-3 transition group-hover:bg-emerald-200">
                  <Icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{value.copy}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            Our journey
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            Building the future of business ops.
          </h2>
        </div>
        <div className="relative mt-10">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-emerald-100 md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.title}
                className={`relative flex items-start gap-6 md:gap-10 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="hidden w-1/2 md:block" />
                <div className="absolute left-4 top-1 h-3 w-3 rounded-full bg-emerald-500 md:left-1/2 md:-translate-x-1/2" />
                <div className="ml-10 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:ml-0 md:w-1/2">
                  <p className="text-xs font-semibold text-emerald-500">
                    {milestone.year}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 overflow-hidden rounded-[28px] bg-linear-to-r from-emerald-500 to-cyan-600 p-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Ready to streamline?
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold">
              Talk to the team about your rollout timeline.
            </h3>
            <p className="mt-2 text-emerald-100">
              Get a personalized demo and see how we can help your business
              group.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
            >
              Book a demo
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Book a call
            </Link>
          </div>
        </div>
      </div>
    </MarketingPageShell>
  );
}
