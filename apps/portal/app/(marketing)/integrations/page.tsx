import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Clock,
  BarChart3,
  Shield,
  RefreshCw,
  Tablet,
  Menu,
  Package,
  Store,
  Star
} from "lucide-react";
import { IntegrationsTable } from "@/components/marketing/integrations-table";

export const metadata: Metadata = {
  title: "Integrations | Crypto Pay",
  description: "Connect 15+ delivery platforms: Uber Eats, DoorDash, Grubhub, Postmates, Deliveroo, and more. POS integration, real-time menu sync, inventory management.",
  keywords: [
    "delivery platform integration",
    "Uber Eats integration",
    "DoorDash integration",
    "Grubhub integration",
    "POS integration",
    "restaurant API",
    "menu sync",
    "order aggregation",
  ],
  openGraph: {
    title: "15+ Delivery Platforms. One Dashboard.",
    description: "Consolidate Uber Eats, DoorDash, Grubhub, Postmates, Deliveroo and more. Real-time menu sync, inventory tracking, and kitchen routing.",
    url: "https://cryptopay.sale/integrations",
    type: "website",
    images: [
      {
        url: "/og-integrations.png",
        width: 1200,
        height: 630,
        alt: "Crypto Pay Platform Integrations",
      },
    ],
  },
};

// Using Logo.dev API - the industry standard for company logos
// Format: https://img.logo.dev/{domain}
const deliveryPlatforms = [
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "DoorDash", domain: "doordash.com" },
  { name: "Grubhub", domain: "grubhub.com" },
  { name: "Deliveroo", domain: "deliveroo.com" },
  { name: "Just Eat", domain: "just-eat.com" },
  { name: "Postmates", domain: "postmates.com" },
  { name: "Instacart", domain: "instacart.com" },
  { name: "Caviar", domain: "trycaviar.com" },
  { name: "Seamless", domain: "seamless.com" },
  { name: "Talabat", domain: "talabat.com" },
  { name: "Zomato", domain: "zomato.com" },
  { name: "Swiggy", domain: "swiggy.com" },
];

// POS System Partners
const posSystems = [
  { name: "Square", domain: "squareup.com" },
  { name: "Toast", domain: "toasttab.com" },
  { name: "Clover", domain: "clover.com" },
  { name: "Lightspeed", domain: "lightspeedhq.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "NCR", domain: "ncr.com" },
];

// Trusted Restaurant Brands
const trustedBrands = [
  { name: "Pizza Hut", domain: "pizzahut.com" },
  { name: "KFC", domain: "kfc.com" },
  { name: "Taco Bell", domain: "tacobell.com" },
  { name: "Wendy's", domain: "wendys.com" },
  { name: "Chipotle", domain: "chipotle.com" },
  { name: "Domino's", domain: "dominos.com" },
  { name: "Subway", domain: "subway.com" },
  { name: "Dunkin'", domain: "dunkindonuts.com" },
];

// Helper function to get logo URL from Logo.dev
const getLogoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;

const stats = [
  { value: "45,000+", label: "Restaurants Trust Us", icon: Store },
  { value: "250M+", label: "Orders Processed Annually", icon: Package },
  { value: "99.99%", label: "System Uptime", icon: Shield },
  { value: "150+", label: "Integrations", icon: Zap },
];

const testimonials = [
  {
    quote: "Managing multiple delivery platforms used to be a nightmare. Now everything flows through one dashboard. Our order errors dropped by 90%.",
    author: "Sarah Chen",
    role: "Operations Director",
    company: "Pacific Kitchen Group",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80",
    metric: "90% fewer errors"
  },
  {
    quote: "The menu sync feature alone saves us 10+ hours per week. Changes propagate to all platforms instantly.",
    author: "Marcus Rodriguez",
    role: "General Manager",
    company: "Taco Republic",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
    metric: "10+ hrs saved/week"
  },
  {
    quote: "We expanded from 3 to 15 locations without adding operations staff. The automation handles everything.",
    author: "Amanda Liu",
    role: "CEO & Founder",
    company: "Golden Dragon Restaurants",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80",
    metric: "5x expansion"
  }
];

const coreFeatures = [
  {
    icon: Tablet,
    title: "Single Dashboard Control",
    description: "Manage orders from Uber Eats, DoorDash, Grubhub, Talabat and 15+ more platforms—all from one screen."
  },
  {
    icon: Menu,
    title: "One-Click Menu Sync",
    description: "Update your menu once and publish changes across all delivery platforms instantly. No more manual updates."
  },
  {
    icon: RefreshCw,
    title: "Real-Time Stock Management",
    description: "Automatically 86 items across all channels when stock runs low. Eliminate order cancellations."
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description: "See sales, performance, and customer data from all platforms in one comprehensive reporting dashboard."
  },
  {
    icon: Clock,
    title: "Auto-Accept Orders",
    description: "Configure smart rules to automatically accept orders during peak hours. Never miss a sale."
  },
  {
    icon: Shield,
    title: "Payment Reconciliation",
    description: "Automatically match payments from delivery platforms with your orders. Catch every discrepancy."
  },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-orange-900 py-20 lg:py-28">
        {/* Grid Background */}
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
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 border border-orange-500/30 px-4 py-2 text-sm font-medium text-orange-300 mb-8">
              <Zap className="h-4 w-4" />
              Powered by UrbanPiper Technology
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              One Dashboard for{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-400">
                All Your Delivery Channels
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop juggling multiple tablets. Integrate Uber Eats, DoorDash, Grubhub, and 15+ delivery platforms 
              directly into your POS. Manage orders, menus, and stock from one screen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/contact?demo=integrations"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-orange-600 transition-all hover:scale-105"
              >
                Get a Free Demo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/technology/delivery-integration"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="h-5 w-5 text-orange-400" />
                    <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Big Brand Logos */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Trusted by Leading Restaurant Brands Worldwide
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {trustedBrands.map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 md:h-16"
              >
                <img 
                  src={getLogoUrl(brand.domain)} 
                  alt={brand.name}
                  className="h-full w-auto object-contain max-w-30 md:max-w-37.5"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Platform Partners */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">Delivery Platforms</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Connect to 20+ Delivery Partners</p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              All major delivery platforms in one place. Orders flow directly into your POS.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {deliveryPlatforms.map((platform, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-xl transition-all group"
              >
                <div className="h-16 w-full flex items-center justify-center mb-3">
                  <img 
                    src={getLogoUrl(platform.domain)} 
                    alt={platform.name}
                    className="max-h-12 max-w-full object-contain group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">{platform.name}</span>
                <span className="text-xs text-green-600 font-semibold uppercase mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Live
                </span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-slate-500">
              Plus Talabat, HungerStation, Careem, Foodpanda, Glovo, and more...
            </p>
          </div>
        </div>
      </section>

      {/* POS System Partners */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">POS Integration</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Works With Your Existing POS</p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No new hardware needed. We integrate directly with your current POS system.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {posSystems.map((pos, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-white hover:shadow-lg transition-all group"
              >
                <div className="h-12 w-full flex items-center justify-center mb-3">
                  <img 
                    src={getLogoUrl(pos.domain)} 
                    alt={pos.name}
                    className="max-h-10 max-w-full object-contain group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm font-medium text-slate-600">{pos.name}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-slate-500 mt-8">
            Don't see your POS? We integrate with 150+ systems.{" "}
            <Link href="/contact" className="text-orange-600 hover:underline font-medium">Contact us</Link>
          </p>
        </div>
      </section>

      {/* Pain Point + Solution Section */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pain Point Side */}
            <div className="relative">
              <div className="absolute -inset-4 bg-red-50 rounded-3xl -rotate-1" />
              <div className="relative bg-white rounded-2xl border-2 border-red-100 p-8 shadow-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-6">
                  ✕ The Problem
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Managing multiple tablets is chaos
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>5+ tablets cluttering your counter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>Missed orders during rush hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>Menu updates take hours across platforms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>Staff constantly switching between apps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✕</span>
                    <span>No unified view of performance data</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Solution Side */}
            <div className="relative">
              <div className="absolute -inset-4 bg-orange-50 rounded-3xl rotate-1" />
              <div className="relative bg-white rounded-2xl border-2 border-orange-200 p-8 shadow-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                  ✓ The Solution
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  One dashboard. Total control.
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>All orders flow into your existing POS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Auto-accept ensures no orders are missed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Update menus everywhere with one click</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Train staff in minutes, not hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <span>360° analytics across all channels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">Features</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage online orders
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From order management to menu sync to analytics—we've built the tools restaurants actually need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Searchable Integrations Table */}
      <IntegrationsTable />

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">Testimonials</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900">
              Trusted by restaurants like yours
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col shadow-sm"
              >
                {/* Metric Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4 w-fit">
                  <Star className="h-4 w-4 fill-current" />
                  {testimonial.metric}
                </div>
                
                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-6 grow">
                  "{testimonial.quote}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-orange-500 to-orange-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify your delivery operations?
          </h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Join 45,000+ restaurants that trust our integration technology. Get a personalized demo and see how much time you can save.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact?demo=integrations"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-orange-600 shadow-lg hover:bg-orange-50 transition-all hover:scale-105"
            >
              Schedule Free Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="tel:+1-888-555-0123"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white hover:bg-orange-700 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-orange-200">
            No credit card required • Setup in under 7 days • Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
