import Link from "next/link";
import {
  Truck,
  Smartphone,
  ArrowRight,
  Check,
  Zap,
  RefreshCcw,
  MonitorSmartphone,
  Printer,
  BarChart3,
  Clock,
  Shield,
  Headphones,
} from "lucide-react";
import { DeliveryPartners } from "@/components/marketing/delivery-partners";

export const metadata = {
  title: "Delivery Integration | Restaurant Hub Solution",
  description: "Consolidate all your delivery platforms into one streamlined system. Manage DoorDash, Uber Eats, Grubhub, and more from a single tablet.",
};

const features = [
  {
    icon: MonitorSmartphone,
    title: "Single Tablet Solution",
    description: "Replace multiple tablets with one unified device. All orders from every platform in one place.",
  },
  {
    icon: Printer,
    title: "Automatic Ticket Printing",
    description: "Orders print directly to your kitchen printer with consistent formatting across all platforms.",
  },
  {
    icon: RefreshCcw,
    title: "Menu Sync",
    description: "Update your menu once and push changes to all delivery platforms simultaneously.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description: "Track performance across all platforms with consolidated reporting and insights.",
  },
  {
    icon: Clock,
    title: "Real-time Order Management",
    description: "Accept, modify, or decline orders instantly. Adjust prep times on the fly.",
  },
  {
    icon: Shield,
    title: "Error Prevention",
    description: "Reduce missed orders and mistakes with automated confirmations and alerts.",
  },
];

const benefits = [
  "Reduce tablet clutter by 80%",
  "Cut order errors by 60%",
  "Save 2+ hours daily on order management",
  "Faster kitchen throughput",
  "Improved customer satisfaction scores",
  "Lower commission disputes",
];

const process = [
  {
    step: "01",
    title: "Platform Audit",
    description: "We analyze your current delivery setup and identify optimization opportunities.",
  },
  {
    step: "02",
    title: "Integration Setup",
    description: "Connect all your delivery platforms to our unified system with zero downtime.",
  },
  {
    step: "03",
    title: "Hardware Configuration",
    description: "Set up your tablet, printers, and kitchen display systems for seamless operation.",
  },
  {
    step: "04",
    title: "Training & Launch",
    description: "Full staff training and go-live support to ensure smooth adoption.",
  },
];

export default function DeliveryIntegrationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
                <Truck className="h-4 w-4" />
                Delivery Integration
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                One tablet to rule{" "}
                <span className="text-orange-500">all delivery platforms</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Stop juggling multiple tablets and missed orders. Our delivery integration
                consolidates DoorDash, Uber Eats, Grubhub, and more into one seamless system
                that prints directly to your kitchen.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Integrated Platforms</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                    All Connected
                  </span>
                </div>
                <DeliveryPartners variant="compact" showLabel={false} className="mb-6" />
                <div className="mt-6 rounded-2xl bg-linear-to-r from-orange-500 to-orange-500 p-4 text-center text-white">
                  <Zap className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-sm font-medium">All orders → One tablet → Your kitchen</p>
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
              Everything you need for{" "}
              <span className="text-orange-500">seamless delivery ops</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our delivery integration platform handles the complexity so your team can focus
              on making great food.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
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
                Results that{" "}
                <span className="text-orange-500">impact your bottom line</span>
              </h2>
              <p className="mt-4 text-slate-600">
                Restaurants using our delivery integration see immediate improvements in
                efficiency and order accuracy.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                      <Check className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-orange-500 p-6 text-white">
                <p className="text-4xl font-bold">80%</p>
                <p className="mt-2 text-sm text-orange-100">Less tablet clutter</p>
              </div>
              <div className="rounded-3xl bg-amber-500 p-6 text-white">
                <p className="text-4xl font-bold">60%</p>
                <p className="mt-2 text-sm text-amber-100">Fewer order errors</p>
              </div>
              <div className="rounded-3xl bg-slate-800 p-6 text-white">
                <p className="text-4xl font-bold">2hrs</p>
                <p className="mt-2 text-sm text-slate-300">Saved daily</p>
              </div>
              <div className="rounded-3xl bg-pink-500 p-6 text-white">
                <p className="text-4xl font-bold">99%</p>
                <p className="mt-2 text-sm text-pink-100">Order accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              How we get you{" "}
              <span className="text-orange-500">up and running</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map((item, index) => (
              <div key={item.step} className="relative">
                {index < process.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-orange-200 lg:block" />
                )}
                <div className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-orange-500 to-orange-600 p-10 text-center text-white shadow-2xl shadow-orange-500/30 lg:p-16">
            <Headphones className="mx-auto mb-6 h-12 w-12 text-orange-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to simplify your delivery operations?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-orange-100">
              Schedule a demo to see how our delivery integration can transform your
              restaurant's efficiency and reduce errors.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                Schedule Demo
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
