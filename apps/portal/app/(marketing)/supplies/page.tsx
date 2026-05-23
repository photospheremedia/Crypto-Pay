import Link from "next/link";
import {
  Package,
  Utensils,
  SprayCan,
  FileText,
  Tag,
  Wrench,
  ChefHat,
  Shield,
  ArrowRight,
  Truck,
  Clock,
  BadgePercent,
} from "lucide-react";

const bundles = [
  {
    title: "Front of house essentials",
    copy: "Receipt rolls, branded bags, napkins, and utensils tailored to your volume.",
    price: "$180+/mo",
  },
  {
    title: "Back of house basics",
    copy: "Gloves, cleaning products, prep containers, and label bundles.",
    price: "$150+/mo",
  },
  {
    title: "Packaging upgrades",
    copy: "Compostable containers, premium lids, and tamper-evident seals.",
    price: "$220+/mo",
  },
];

const categories = [
  { name: "Packaging", icon: Package, count: "45+ items" },
  { name: "Utensils", icon: Utensils, count: "30+ items" },
  { name: "Cleaning", icon: SprayCan, count: "25+ items" },
  { name: "Paper & receipts", icon: FileText, count: "20+ items" },
  { name: "Labels", icon: Tag, count: "35+ items" },
  { name: "Smallwares", icon: Wrench, count: "40+ items" },
  { name: "Kitchen tools", icon: ChefHat, count: "50+ items" },
  { name: "Safety & PPE", icon: Shield, count: "15+ items" },
];

const benefits = [
  {
    icon: BadgePercent,
    title: "Reseller pricing",
    description: "Get wholesale rates on all supplies with no minimum orders.",
  },
  {
    icon: Truck,
    title: "Direct shipping",
    description: "Supplies ship directly to your locations from our network.",
  },
  {
    icon: Clock,
    title: "24-hour quotes",
    description: "Receive custom quotes within one business day.",
  },
];

export default function SuppliesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      {/* Hero */}
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Supplies
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
            Curated supply bundles with restaurant-ready margins.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            We build and quote bundles sourced from trusted suppliers, then
            manage fulfillment and reorder cadence for each location.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="group flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-orange-600"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
            >
              Request a quote
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-linear-to-br from-orange-50 to-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Popular bundles
          </p>
          <div className="mt-4 space-y-3">
            {bundles.map((bundle) => (
              <div
                key={bundle.title}
                className="group rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {bundle.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{bundle.copy}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    {bundle.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="rounded-xl bg-orange-100 p-3">
                <Icon className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Images */}
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          "/images/supply-grid.svg",
          "/images/hero-dashboard.svg",
          "/images/branding-refresh.svg",
        ].map((src, index) => (
          <div
            key={src}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <img
              src={src}
              alt={`Supply bundle showcase ${index + 1}`}
              className="aspect-4/3 w-full object-cover transition duration-500 group-hover:scale-105 md:aspect-16/10"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
            Categories we cover
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-slate-900">
            Everything your restaurant needs.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href="/shop"
                className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <Icon className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 overflow-hidden rounded-[28px] bg-linear-to-r from-orange-500 to-orange-600 p-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
              Need a bundled quote?
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold">
              We&apos;ll assemble a supply kit for each location.
            </h3>
            <p className="mt-2 text-orange-100">
              Get custom bundles with volume discounts and recurring delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Request a quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
