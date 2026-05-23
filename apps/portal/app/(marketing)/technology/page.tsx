import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  Smartphone, 
  BarChart3, 
  RefreshCw, 
  Globe, 
  Zap, 
  Shield, 
  CheckCircle,
  Tablet,
  LineChart,
  Settings,
  Cloud
} from "lucide-react";

export const metadata: Metadata = {
  title: "Technology | Restaurant Hub Solution",
  description: "Our modern restaurant operations platform: delivery integration, supply marketplace, real-time analytics, and AI customer support. Built for scale.",
  keywords: [
    "restaurant technology",
    "restaurant software",
    "delivery management software",
    "restaurant analytics",
    "kitchen management system",
    "AI chatbot for restaurants",
  ],
  openGraph: {
    title: "Modern Technology for Restaurant Operations",
    description: "Delivery consolidation, supply management, real-time analytics, and AI support. One unified platform.",
    url: "https://restauranthubsolution.com/technology",
    type: "website",
  },
};

const features = [
  {
    id: "delivery-integration",
    icon: Tablet,
    title: "Delivery Integration Suite",
    description: "Consolidate all your delivery platforms into one unified dashboard. Manage orders from Uber Eats, DoorDash, Grubhub, and more without juggling multiple tablets.",
    benefits: [
      "Single tablet for all platforms",
      "Auto-accept and route orders",
      "Real-time order tracking",
      "Unified reporting dashboard"
    ],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
  },
  {
    id: "custom-ordering",
    icon: Globe,
    title: "Custom Online Ordering",
    description: "Your own branded ordering website with zero commissions. Keep 100% of your profits while offering customers a seamless ordering experience.",
    benefits: [
      "Zero commission fees",
      "Branded mobile app",
      "Customer loyalty programs",
      "Integrated payment processing"
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: "analytics",
    icon: LineChart,
    title: "Analytics & Insights",
    description: "Make data-driven decisions with comprehensive analytics. Track sales trends, customer behavior, and operational metrics in real-time.",
    benefits: [
      "Sales trend analysis",
      "Peak hour identification",
      "Menu performance metrics",
      "Customer insights"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
  },
  {
    id: "menu-management",
    icon: Settings,
    title: "Menu Management",
    description: "Update your menu once and sync across all platforms automatically. No more manually updating each delivery app separately.",
    benefits: [
      "One-click menu sync",
      "Price management",
      "Item availability control",
      "Photo optimization"
    ],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop"
  }
];

const stats = [
  { value: "30%", label: "Average time saved" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "24/7", label: "Support available" },
  { value: "500+", label: "Restaurants using" }
];

export default function TechnologyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-orange-900 py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
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
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300">
              <Zap className="h-4 w-4" />
              Technology Suite
            </div>
            
            <h1 className="mt-8 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Powerful tech for{" "}
              <span className="bg-linear-to-r from-orange-400 to-teal-300 bg-clip-text text-transparent">
                modern restaurants
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Streamline operations, boost efficiency, and grow your business with our integrated technology platform designed specifically for restaurants.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/quote"
                className="group flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Schedule Demo
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <section 
          key={feature.id} 
          id={feature.id}
          className={`py-20 ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className={`grid items-center gap-12 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                  <feature.icon className="h-7 w-7 text-orange-500" />
                </div>
                
                <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">
                  {feature.title}
                </h2>
                
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="mt-8 space-y-4">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 shrink-0" />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/quote"
                  className="mt-8 inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Image */}
              <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full w-full object-cover aspect-4/3"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-orange-100" />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-orange-500 to-orange-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to modernize your restaurant?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
            Join hundreds of restaurants already using our technology platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quote"
              className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-xl transition hover:bg-orange-50"
            >
              Get a Quote
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
