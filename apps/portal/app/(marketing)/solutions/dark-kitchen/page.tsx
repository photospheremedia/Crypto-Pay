import Link from "next/link";
import {
  ChefHat,
  ArrowRight,
  Check,
  Truck,
  BarChart3,
  Clock,
  Zap,
  Target,
  Package,
  Smartphone,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export const metadata = {
  title: "Dark Kitchen Solutions | Crypto Pay",
  description: "Launch and scale delivery-only business concepts with optimized operations, multi-brand management, and data-driven insights.",
};

const features = [
  {
    icon: Smartphone,
    title: "Multi-Brand Management",
    description: "Run multiple virtual brands from one kitchen with separate menus and branding on each platform.",
  },
  {
    icon: Truck,
    title: "Delivery Optimization",
    description: "Optimize prep times, packaging, and routing to maximize delivery quality and speed.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track metrics that matter: prep time, delivery time, ratings, and profitability per brand.",
  },
  {
    icon: Clock,
    title: "Automated Scheduling",
    description: "Smart scheduling based on order patterns to ensure efficient labor allocation.",
  },
  {
    icon: Target,
    title: "Market Analysis",
    description: "Data-driven insights on what cuisines and price points work best in your delivery zone.",
  },
  {
    icon: Package,
    title: "Packaging Solutions",
    description: "Curated packaging that travels well and maintains food quality on delivery.",
  },
];

const brandExamples = [
  {
    name: "Crispy Kingdom",
    cuisine: "Fried Chicken",
    color: "bg-amber-500",
    avgOrder: "$24",
  },
  {
    name: "Bowl'd Over",
    cuisine: "Poke & Bowls",
    color: "bg-orange-500",
    avgOrder: "$18",
  },
  {
    name: "Stack House",
    cuisine: "Smash Burgers",
    color: "bg-red-500",
    avgOrder: "$22",
  },
  {
    name: "Wok This Way",
    cuisine: "Asian Fusion",
    color: "bg-pink-500",
    avgOrder: "$21",
  },
];

const metrics = [
  { value: "40%", label: "Lower Overhead", description: "vs. traditional businesses" },
  { value: "5+", label: "Brands Per Kitchen", description: "Average client operates" },
  { value: "15min", label: "Avg. Prep Time", description: "Across all concepts" },
  { value: "4.6★", label: "Avg. Rating", description: "Across delivery platforms" },
];

const launchProcess = [
  {
    title: "Market Research",
    description: "Analyze your delivery zone to identify high-demand, low-competition cuisines.",
  },
  {
    title: "Concept Development",
    description: "Design virtual brand identities, menus, and pricing strategies.",
  },
  {
    title: "Kitchen Setup",
    description: "Optimize your kitchen layout and workflows for multi-brand efficiency.",
  },
  {
    title: "Platform Launch",
    description: "Launch on all major delivery platforms with optimized listings and photos.",
  },
  {
    title: "Growth & Scale",
    description: "Monitor performance and iterate on menus and marketing to maximize revenue.",
  },
];

export default function DarkKitchenPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200">
                <ChefHat className="h-4 w-4" />
                Dark Kitchen
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Multiple brands,{" "}
                <span className="text-slate-700">one kitchen</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Launch delivery-only business concepts without the overhead. Run multiple
                virtual brands from a single kitchen and capture more market share.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-800/30 transition hover:bg-slate-900"
                >
                  Launch Your Brand
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  See Packages
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                <p className="mb-4 text-center text-sm font-medium text-slate-500">
                  One Kitchen, Multiple Brands
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {brandExamples.map((brand) => (
                    <div
                      key={brand.name}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-white hover:shadow-md"
                    >
                      <div className={`mb-3 h-3 w-12 rounded-full ${brand.color}`} />
                      <p className="font-semibold text-slate-900">{brand.name}</p>
                      <p className="text-xs text-slate-500">{brand.cuisine}</p>
                      <p className="mt-2 text-sm font-medium text-orange-500">
                        {brand.avgOrder} avg
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 p-4 text-center text-white">
                  <Zap className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                  <p className="text-sm font-medium">4x Revenue Potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-white/80 bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="font-display text-3xl font-bold text-slate-800">{metric.value}</p>
                <p className="font-semibold text-slate-900">{metric.label}</p>
                <p className="mt-1 text-sm text-slate-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Everything you need to{" "}
              <span className="text-slate-700">run virtual brands</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-slate-400 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-600 transition group-hover:bg-slate-800 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch Process */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              From concept to{" "}
              <span className="text-slate-700">launch</span>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-slate-200 md:block" />
            <div className="space-y-8">
              {launchProcess.map((step, index) => (
                <div key={step.title} className="flex gap-6">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6">
                    <h3 className="mb-2 font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Potential */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12">
            <div className="mb-8 text-center">
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-orange-500" />
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Revenue Potential Calculator
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">Single Brand</p>
                <p className="mt-2 text-3xl font-bold text-slate-400">$15k/mo</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-6 text-center">
                <p className="text-sm text-orange-500">3 Virtual Brands</p>
                <p className="mt-2 text-3xl font-bold text-orange-500">$45k/mo</p>
              </div>
              <div className="rounded-2xl bg-orange-100 p-6 text-center">
                <p className="text-sm text-orange-600">5+ Brands</p>
                <p className="mt-2 text-3xl font-bold text-orange-600">$75k+/mo</p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              *Based on average performance across dark kitchen clients in major metro areas
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-slate-800 to-slate-900 p-10 text-center text-white shadow-2xl lg:p-16">
            <ChefHat className="mx-auto mb-6 h-12 w-12 text-amber-400" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to multiply your revenue?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Let us analyze your market and help you launch virtual brands that capture
              untapped delivery demand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Get Market Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/solutions/multi-location"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Multi-Location
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
