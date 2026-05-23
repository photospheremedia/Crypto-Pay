"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ArrowLeft,
  Globe,
  CheckCircle,
  Smartphone,
  CreditCard,
  Users,
  Heart,
  Palette,
  ShoppingCart,
  Percent,
  Star
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Your Branded Website",
    description: "A beautiful, mobile-optimized ordering site with your logo, colors, and branding."
  },
  {
    icon: Smartphone,
    title: "Mobile App Ready",
    description: "Optional native iOS and Android apps for the ultimate customer experience."
  },
  {
    icon: Percent,
    title: "Zero Commissions",
    description: "Keep 100% of your order revenue. No per-order fees eating into your margins."
  },
  {
    icon: Heart,
    title: "Loyalty Programs",
    description: "Built-in rewards system to keep customers coming back and ordering direct."
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description: "Accept cards, Apple Pay, Google Pay with competitive processing rates."
  },
  {
    icon: Users,
    title: "Customer Database",
    description: "Own your customer data. Send targeted promotions and build relationships."
  }
];

const comparisons = [
  { feature: "Commission per order", thirdParty: "15-30%", directOrdering: "0%" },
  { feature: "Customer data ownership", thirdParty: "No", directOrdering: "Yes" },
  { feature: "Your branding", thirdParty: "Limited", directOrdering: "Full control" },
  { feature: "Menu pricing control", thirdParty: "Restricted", directOrdering: "Complete" },
  { feature: "Loyalty program", thirdParty: "Platform's", directOrdering: "Yours" },
  { feature: "Marketing to customers", thirdParty: "Blocked", directOrdering: "Unlimited" },
];

const benefits = [
  { value: "0%", label: "Commission fees" },
  { value: "100%", label: "Brand control" },
  { value: "3x", label: "Customer retention" },
  { value: "48hr", label: "Launch time" },
];

export default function CustomOrderingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-indigo-800 to-purple-900 py-20 lg:py-28">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6">
          <Link 
            href="/technology" 
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Technology
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 mb-6">
                <Globe className="h-4 w-4" />
                Custom Online Ordering
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Your Restaurant.<br />Your Website.<br />Zero Commissions.
              </h1>
              
              <p className="text-xl text-blue-100/80 mb-8">
                Stop paying 15-30% per order to third-party apps. Launch your own branded 
                ordering website and keep 100% of your revenue.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-900 hover:bg-blue-50 transition"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-blue-400 px-6 py-3 font-semibold text-white hover:bg-blue-800 transition"
                >
                  See Demo Site
                </Link>
              </div>
            </div>
            
            {/* Mock ordering interface */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-red-500" />
                  <div>
                    <div className="font-bold text-slate-900">Your Restaurant</div>
                    <div className="text-sm text-slate-500">Online Ordering</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-24" />
                      </div>
                      <div className="font-bold text-orange-500">$12.99</div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Third-Party Apps vs Direct Ordering
            </h2>
            <p className="text-lg text-slate-600">
              See why restaurants are switching to direct ordering
            </p>
          </div>
          
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-red-600">Third-Party Apps</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-orange-500">Direct Ordering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-red-600">{row.thirdParty}</td>
                    <td className="px-6 py-4 text-center text-orange-500 font-semibold">{row.directOrdering}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Stop Giving Away Your Profits
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Launch your branded ordering website in 48 hours. No long-term contracts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
