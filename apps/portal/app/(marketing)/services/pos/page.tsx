import Link from "next/link";
import {
  Monitor,
  ArrowRight,
  Check,
  RefreshCcw,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Smartphone,
  Printer,
  CreditCard,
  Settings,
} from "lucide-react";

export const metadata = {
  title: "POS Integration | Crypto Pay",
  description: "Seamlessly connect your POS system with delivery platforms for automatic order routing and real-time menu sync.",
};

const integrations = [
  { name: "Toast", category: "POS" },
  { name: "Square", category: "POS" },
  { name: "Clover", category: "POS" },
  { name: "Lightspeed", category: "POS" },
  { name: "Revel", category: "POS" },
  { name: "TouchBistro", category: "POS" },
  { name: "Aloha", category: "POS" },
  { name: "Micros", category: "POS" },
];

const features = [
  {
    icon: RefreshCcw,
    title: "Automatic Order Injection",
    description: "Delivery orders flow directly into your POS as if taken at the counter. No manual entry needed.",
  },
  {
    icon: Zap,
    title: "Real-Time Menu Sync",
    description: "Update prices or 86 an item in your POS—changes reflect on all delivery platforms instantly.",
  },
  {
    icon: Printer,
    title: "Smart Ticket Routing",
    description: "Orders print to the right kitchen station automatically based on item type and prep requirements.",
  },
  {
    icon: BarChart3,
    title: "Unified Reporting",
    description: "See dine-in, takeout, and delivery sales in one dashboard with real-time analytics.",
  },
  {
    icon: CreditCard,
    title: "Payment Reconciliation",
    description: "Automatic matching of delivery platform payouts with POS transactions.",
  },
  {
    icon: Settings,
    title: "Custom Modifiers",
    description: "Complex modifier trees and special instructions sync perfectly between systems.",
  },
];

const benefits = [
  {
    stat: "Zero",
    label: "Manual Entry",
    description: "Orders inject directly into your POS",
  },
  {
    stat: "100%",
    label: "Menu Accuracy",
    description: "Real-time sync prevents ordering errors",
  },
  {
    stat: "5min",
    label: "Setup Time",
    description: "Most integrations activate same-day",
  },
  {
    stat: "24/7",
    label: "Support",
    description: "Technical help whenever you need it",
  },
];

const howItWorks = [
  {
    title: "Connect Your POS",
    description: "We establish a secure connection with your existing point-of-sale system.",
  },
  {
    title: "Map Your Menu",
    description: "Link menu items between your POS and delivery platforms with smart matching.",
  },
  {
    title: "Configure Routing",
    description: "Set up ticket printing, station routing, and modifier handling.",
  },
  {
    title: "Go Live",
    description: "Orders start flowing automatically with full staff training included.",
  },
];

export default function POSIntegrationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                <Monitor className="h-4 w-4" />
                POS Integration
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Your POS and delivery apps,{" "}
                <span className="text-purple-600">finally in sync</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Eliminate manual order entry and menu mismatches. Our POS integration
                connects your existing system with every delivery platform for seamless
                operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-700"
                >
                  Check Compatibility
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/services/delivery"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50"
                >
                  View All Services
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
                <p className="mb-6 text-center text-sm font-medium text-slate-500">
                  Supported POS Systems
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.name}
                      className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center transition hover:border-purple-200 hover:bg-purple-50"
                    >
                      <Monitor className="mb-2 h-6 w-6 text-purple-500" />
                      <span className="text-xs font-medium text-slate-700">{integration.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-linear-to-r from-purple-500 to-purple-600 p-4 text-center">
                  <p className="text-sm font-medium text-white">
                    Don't see your POS? We support 50+ systems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="border-y border-white/80 bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.label} className="text-center">
                <p className="font-display text-3xl font-bold text-purple-600">{benefit.stat}</p>
                <p className="font-semibold text-slate-900">{benefit.label}</p>
                <p className="mt-1 text-sm text-slate-600">{benefit.description}</p>
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
              Everything syncs{" "}
              <span className="text-purple-600">automatically</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our integration handles all the complexity so your team can focus on serving
              customers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-purple-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-purple-100 p-3 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              How{" "}
              <span className="text-purple-600">integration works</span>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-purple-200 lg:block" />
            <div className="space-y-8">
              {howItWorks.map((step, index) => (
                <div
                  key={step.title}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <div className="hidden lg:block lg:w-1/2" />
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-1/2">
                    <h3 className="mb-2 font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration Flow Visualization */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12">
            <h3 className="mb-8 text-center font-display text-2xl font-bold text-slate-900">
              Order Flow
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="rounded-2xl bg-orange-100 p-4 text-center">
                <Smartphone className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                <p className="text-sm font-medium text-orange-600">Delivery Apps</p>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-400" />
              <div className="rounded-2xl bg-purple-100 p-4 text-center">
                <Zap className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                <p className="text-sm font-medium text-purple-700">Our Integration</p>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-400" />
              <div className="rounded-2xl bg-amber-100 p-4 text-center">
                <Monitor className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                <p className="text-sm font-medium text-amber-700">Your POS</p>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-400" />
              <div className="rounded-2xl bg-pink-100 p-4 text-center">
                <Printer className="mx-auto mb-2 h-8 w-8 text-pink-600" />
                <p className="text-sm font-medium text-pink-700">Kitchen Printer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-purple-600 to-purple-700 p-10 text-center text-white shadow-2xl shadow-purple-600/30 lg:p-16">
            <Shield className="mx-auto mb-6 h-12 w-12 text-purple-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to connect your POS?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-purple-100">
              Tell us which POS system you use and we'll show you exactly how the
              integration will work for your business.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Check Compatibility
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
