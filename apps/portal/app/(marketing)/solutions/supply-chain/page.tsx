import Link from "next/link";
import {
  Package,
  ArrowRight,
  Check,
  Truck,
  BarChart3,
  Clock,
  Shield,
  DollarSign,
  RefreshCcw,
  TrendingDown,
  FileText,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Supply Chain Solutions | Restaurant Hub Solution",
  description: "Optimize your procurement with group purchasing, vendor management, and inventory systems that reduce costs and improve efficiency.",
};

const features = [
  {
    icon: DollarSign,
    title: "Group Purchasing Power",
    description: "Leverage collective buying power to negotiate better prices with suppliers.",
  },
  {
    icon: BarChart3,
    title: "Spend Analytics",
    description: "Detailed insights into purchasing patterns to identify savings opportunities.",
  },
  {
    icon: Truck,
    title: "Vendor Management",
    description: "Streamlined vendor relationships with performance tracking and contract management.",
  },
  {
    icon: RefreshCcw,
    title: "Automated Ordering",
    description: "Par-level based automatic ordering that maintains optimal inventory levels.",
  },
  {
    icon: Clock,
    title: "Just-in-Time Delivery",
    description: "Coordinated delivery schedules that minimize storage needs and waste.",
  },
  {
    icon: FileText,
    title: "Invoice Processing",
    description: "Automated invoice matching and payment processing to reduce admin overhead.",
  },
];

const savings = [
  {
    category: "Proteins",
    typical: "$4.50/lb",
    withUs: "$3.85/lb",
    savings: "14%",
  },
  {
    category: "Produce",
    typical: "$2.20/lb",
    withUs: "$1.90/lb",
    savings: "14%",
  },
  {
    category: "Packaging",
    typical: "$0.45/unit",
    withUs: "$0.35/unit",
    savings: "22%",
  },
  {
    category: "Cleaning",
    typical: "$85/case",
    withUs: "$68/case",
    savings: "20%",
  },
];

const process = [
  {
    title: "Supply Audit",
    description: "We analyze your current vendors, pricing, and ordering patterns to identify opportunities.",
  },
  {
    title: "Vendor Negotiation",
    description: "Leverage our buying power to negotiate better terms with existing and new suppliers.",
  },
  {
    title: "System Setup",
    description: "Implement inventory management and automated ordering systems.",
  },
  {
    title: "Ongoing Optimization",
    description: "Continuous monitoring and adjustment to maximize savings and efficiency.",
  },
];

const testimonial = {
  quote: "We cut our food costs by 18% in the first year. The automated ordering alone saves us 10 hours a week in admin work.",
  author: "David Park",
  role: "Owner",
  company: "Seoul Kitchen (3 locations)",
  savings: "$45,000/year",
};

const stats = [
  { value: "15-25%", label: "Average Cost Savings" },
  { value: "500+", label: "Verified Suppliers" },
  { value: "48hr", label: "Delivery Guarantee" },
  { value: "99.2%", label: "Order Accuracy" },
];

export default function SupplyChainPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                <Package className="h-4 w-4" />
                Supply Chain
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Lower costs,{" "}
                <span className="text-teal-600">better margins</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Optimize your procurement with group purchasing power, automated ordering,
                and real-time inventory management that reduces waste and improves margins.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-700"
                >
                  Get Savings Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/supplies"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  Browse Supplies
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                <p className="mb-4 text-center text-sm font-medium text-slate-500">
                  Average Savings by Category
                </p>
                <div className="space-y-4">
                  {savings.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.category}</p>
                        <p className="text-sm text-slate-500">
                          <span className="line-through">{item.typical}</span> →{" "}
                          <span className="text-teal-600 font-medium">{item.withUs}</span>
                        </p>
                      </div>
                      <div className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-700">
                        -{item.savings}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-linear-to-r from-teal-500 to-teal-600 p-4 text-center text-white">
                  <TrendingDown className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-xl font-bold">15-25% Total Savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/80 bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-teal-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
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
              End-to-end{" "}
              <span className="text-teal-600">supply chain management</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-teal-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-teal-100 p-3 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
              <div>
                <blockquote className="text-xl text-slate-700">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-teal-600 p-6 text-center text-white">
                <p className="text-sm text-teal-100">Annual Savings</p>
                <p className="text-3xl font-bold">{testimonial.savings}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              How we{" "}
              <span className="text-teal-600">reduce your costs</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map((item, index) => (
              <div key={item.title} className="relative">
                {index < process.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-0.5 w-full bg-teal-200 lg:block" style={{ left: '50%' }} />
                )}
                <div className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Network */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Verified{" "}
                <span className="text-teal-600">supplier network</span>
              </h2>
              <p className="mt-4 text-slate-600">
                Every supplier in our network is vetted for quality, reliability, and
                pricing. We monitor performance and only work with the best.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Food safety certified suppliers",
                  "Real-time pricing and availability",
                  "Performance scorecards",
                  "Backup supplier coverage",
                  "Local and national options",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">
                      <Check className="h-4 w-4 text-teal-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <Shield className={`h-8 w-8 ${i < 7 ? "text-teal-500" : "text-slate-300"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-teal-600 to-teal-700 p-10 text-center text-white shadow-2xl shadow-teal-600/30 lg:p-16">
            <DollarSign className="mx-auto mb-6 h-12 w-12 text-teal-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to cut your supply costs?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-teal-100">
              Get a free supply audit and see exactly how much you could save with our
              procurement solutions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                Get Free Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/supplies"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Browse Supplies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
