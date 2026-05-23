import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Palette,
  GraduationCap,
  HeadphonesIcon,
  Check,
  ArrowRight,
  Zap,
  Clock,
  Users,
  BarChart3,
  Monitor,
  Megaphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services | Restaurant Hub Solution",
  description: "Full-stack restaurant operations services: delivery platform consolidation, supply chain management, brand refresh, menu design, and ongoing support.",
  keywords: [
    "restaurant operations services",
    "delivery consolidation",
    "supply chain management",
    "restaurant branding",
    "menu design services",
    "restaurant consulting",
  ],
  openGraph: {
    title: "End-to-End Restaurant Operations Support",
    description: "From delivery integration to supply procurement to brand refresh. Your single partner for restaurant growth.",
    url: "https://restauranthubsolution.com/services",
    type: "website",
    images: [
      {
        url: "/og-services.png",
        width: 1200,
        height: 630,
        alt: "Restaurant Hub Solution Services",
      },
    ],
  },
};

const offerings = [
  {
    title: "Delivery platform consolidation",
    copy: "Unify delivery apps into one tablet with POS, printer, and kitchen routing configured for every location.",
    items: ["Menu sync", "Tablet setup", "POS routing", "Kitchen display"],
    icon: Truck,
    color: "orange",
    href: "/services/delivery",
  },
  {
    title: "Marketing & menu refresh",
    copy: "Brand-forward menus, landing pages, and campaigns that increase conversion and reorder velocity.",
    items: ["Menu redesign", "Web updates", "Email templates", "Promo planning"],
    icon: Palette,
    color: "pink",
    href: "/services/branding",
  },
  {
    title: "POS Integration",
    copy: "Seamlessly connect your POS system with delivery platforms for automatic order routing and real-time menu sync.",
    items: ["Order injection", "Menu sync", "Ticket routing", "Reconciliation"],
    icon: Monitor,
    color: "amber",
    href: "/services/pos",
  },
  {
    title: "Marketing Support",
    copy: "Drive more orders with strategic marketing campaigns, email automation, and data-driven promotion planning.",
    items: ["Email campaigns", "SMS marketing", "Paid ads", "Analytics"],
    icon: Megaphone,
    color: "orange",
    href: "/services/marketing",
  },
];

const colorClasses: Record<string, { bg: string; text: string; badge: string }> = {
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-500",
    badge: "bg-orange-50 text-orange-600",
  },
  pink: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    badge: "bg-pink-50 text-pink-700",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
  },
};

const process = [
  {
    step: 1,
    title: "Discovery call",
    description: "We learn about your locations, delivery stack, and pain points.",
    icon: Users,
  },
  {
    step: 2,
    title: "Rollout plan",
    description: "Custom plan with timeline, pricing, and integration scope.",
    icon: BarChart3,
  },
  {
    step: 3,
    title: "Implementation",
    description: "We configure systems, train staff, and go live in 2-3 weeks.",
    icon: Zap,
  },
  {
    step: 4,
    title: "Ongoing support",
    description: "Continuous optimization, menu updates, and dedicated success lead.",
    icon: HeadphonesIcon,
  },
];

export default function ServicesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      {/* Hero */}
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Services
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
            A full-stack partner for restaurant growth.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            From delivery stack integration to marketing execution, Restaurant
            Hub Solution is the single team that owns your launch plan,
            automation, and ongoing optimization.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="group rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-orange-600"
            >
              Get a Quote
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
            >
              View pricing
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-linear-to-br from-orange-50 to-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Included in onboarding
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "POS routing + menu sync",
              "Delivery channel mapping",
              "Brand audit + recommendations",
              "Supply bundle roadmap",
              "Staff training sessions",
              "Go-live support",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700"
              >
                <Check className="h-4 w-4 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Images */}
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop", alt: "Analytics dashboard" },
          { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", alt: "Restaurant branding" },
          { src: "https://images.unsplash.com/photo-1604756930505-1b1a0c1ed4a3?w=600&h=400&fit=crop", alt: "Restaurant supplies" },
        ].map((image, index) => (
          <div
            key={image.src}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-105 md:aspect-16/10"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Services grid */}
      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
            What we do
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            End-to-end restaurant operations support.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {offerings.map((offer) => {
            const Icon = offer.icon;
            const colors = colorClasses[offer.color];
            return (
              <Link
                key={offer.title}
                href={offer.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-lg"
              >
                <div
                  className={`inline-flex rounded-2xl ${colors.bg} p-3 transition group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {offer.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{offer.copy}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {offer.items.map((item) => (
                    <span
                      key={item}
                      className={`rounded-full ${colors.badge} px-3 py-1.5 text-xs font-medium`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Process */}
      <div className="mt-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
            How it works
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-slate-900">
            From first call to live in 2-3 weeks.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {process.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {index < process.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-orange-100 md:block" />
                )}
                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                      {step.step}
                    </div>
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline banner */}
      <div className="mt-16 rounded-3xl border border-orange-200 bg-linear-to-r from-orange-50 to-purple-50 p-8">
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <Clock className="mx-auto h-8 w-8 text-orange-500" />
            <p className="mt-2 text-2xl font-bold text-slate-900">14 days</p>
            <p className="text-sm text-slate-600">Average onboarding</p>
          </div>
          <div className="hidden h-12 w-px bg-orange-200 md:block" />
          <div>
            <Users className="mx-auto h-8 w-8 text-orange-500" />
            <p className="mt-2 text-2xl font-bold text-slate-900">Dedicated</p>
            <p className="text-sm text-slate-600">Success manager</p>
          </div>
          <div className="hidden h-12 w-px bg-orange-200 md:block" />
          <div>
            <Zap className="mx-auto h-8 w-8 text-orange-500" />
            <p className="mt-2 text-2xl font-bold text-slate-900">24 hours</p>
            <p className="text-sm text-slate-600">Support response</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 overflow-hidden rounded-[28px] bg-linear-to-r from-orange-500 to-orange-600 p-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
              Ready to launch?
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold">
              Book a rollout workshop with our team.
            </h3>
            <p className="mt-2 text-orange-100">
              Get a personalized plan for your restaurant group in 30 minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Schedule a call
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
