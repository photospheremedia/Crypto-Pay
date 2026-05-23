import Link from "next/link";
import {
  Building,
  ArrowRight,
  Check,
  Users,
  BarChart3,
  Shield,
  BookOpen,
  Headphones,
  Globe,
  Settings,
  TrendingUp,
  Award,
} from "lucide-react";

export const metadata = {
  title: "Franchise Support | Crypto Pay",
  description: "Scalable systems and support for franchise operations. Standardized processes, training, and technology across all locations.",
};

const services = [
  {
    icon: BookOpen,
    title: "Operations Manual",
    description: "Comprehensive documentation of processes, recipes, and standards for consistent execution.",
  },
  {
    icon: Users,
    title: "Training Programs",
    description: "Structured onboarding and ongoing training materials for franchisee staff.",
  },
  {
    icon: Settings,
    title: "Technology Stack",
    description: "Unified POS, inventory, and reporting systems that work across all franchise locations.",
  },
  {
    icon: BarChart3,
    title: "Performance Benchmarking",
    description: "Compare location performance and identify best practices to share across the network.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Regular audits and mystery shops to ensure brand standards are maintained.",
  },
  {
    icon: Headphones,
    title: "Franchisee Support",
    description: "Dedicated support team to help franchisees succeed with marketing and operations.",
  },
];

const benefits = [
  "Faster franchisee onboarding",
  "Consistent customer experience",
  "Reduced support overhead",
  "Better unit economics",
  "Scalable infrastructure",
  "Data-driven decisions",
];

const testimonials = [
  {
    quote: "The systems they put in place cut our franchisee onboarding time in half. New owners are productive from day one.",
    author: "Michael Torres",
    role: "VP Franchise Development",
    company: "Fresh Greens Co.",
  },
  {
    quote: "Having unified reporting across 50+ locations gives us visibility we never had before. We can spot trends and act fast.",
    author: "Jennifer Walsh",
    role: "Director of Operations",
    company: "Sunrise Bakery Cafe",
  },
];

const packages = [
  {
    name: "Launch",
    description: "For emerging franchise brands",
    features: [
      "Operations manual template",
      "Basic training program",
      "POS integration",
      "Monthly reporting",
    ],
    price: "Custom",
  },
  {
    name: "Growth",
    description: "For expanding networks",
    features: [
      "Everything in Launch",
      "Advanced analytics",
      "Quality assurance program",
      "Marketing playbooks",
      "Dedicated account manager",
    ],
    price: "Custom",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For established franchises",
    features: [
      "Everything in Growth",
      "Custom integrations",
      "On-site training",
      "Franchisee portal",
      "API access",
      "SLA guarantee",
    ],
    price: "Custom",
  },
];

const stats = [
  { value: "500+", label: "Franchise Locations Supported" },
  { value: "45%", label: "Faster Onboarding" },
  { value: "98%", label: "Brand Compliance Rate" },
  { value: "24/7", label: "Support Availability" },
];

export default function FranchisePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                <Building className="h-4 w-4" />
                Franchise Support
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Scale your franchise{" "}
                <span className="text-orange-600">with confidence</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Standardized systems, training programs, and technology infrastructure that
                enable consistent execution across your entire franchise network.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
                >
                  Talk to Franchise Team
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/solutions/multi-location"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  Multi-Location
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Franchise Network</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    50 Locations
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg ${
                        i < 22 ? "bg-orange-500" : "bg-orange-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-orange-50 p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">98%</p>
                    <p className="text-xs text-orange-700">Compliance</p>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-4 text-center">
                    <p className="text-2xl font-bold text-orange-500">+12%</p>
                    <p className="text-xs text-orange-600">YoY Growth</p>
                  </div>
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
                <p className="font-display text-3xl font-bold text-orange-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Complete franchise{" "}
              <span className="text-orange-600">infrastructure</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{service.title}</h3>
                <p className="text-sm text-slate-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Why franchises{" "}
                <span className="text-orange-600">choose us</span>
              </h2>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                      <Check className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.author}
                  className="rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <blockquote className="text-slate-600">"{testimonial.quote}"</blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-500">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Support{" "}
              <span className="text-orange-600">packages</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-3xl border p-6 transition ${
                  pkg.highlighted
                    ? "border-orange-300 bg-orange-50 shadow-lg"
                    : "border-slate-200 bg-white hover:border-orange-200"
                }`}
              >
                {pkg.highlighted && (
                  <span className="mb-4 inline-block rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-slate-900">{pkg.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
                <ul className="mt-6 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-orange-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`mt-6 block rounded-full px-4 py-2 text-center text-sm font-semibold transition ${
                    pkg.highlighted
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "border border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50"
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
          <div className="rounded-3xl bg-linear-to-br from-orange-600 to-orange-700 p-10 text-center text-white shadow-2xl shadow-orange-600/30 lg:p-16">
            <Globe className="mx-auto mb-6 h-12 w-12 text-orange-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to scale your franchise?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-orange-100">
              Let's discuss how we can help you build the infrastructure for sustainable
              franchise growth.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Schedule Consultation
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
