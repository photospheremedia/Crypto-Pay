"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ArrowLeft,
  Tablet,
  CheckCircle,
  Zap,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  RefreshCw,
  Bell
} from "lucide-react";

const features = [
  {
    icon: Tablet,
    title: "Single Dashboard",
    description: "Manage orders from Uber Eats, DoorDash, Grubhub, Postmates, and more—all from one tablet."
  },
  {
    icon: RefreshCw,
    title: "Auto-Accept Orders",
    description: "Configure automatic order acceptance rules to never miss a sale during peak hours."
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts for new orders, updates, and issues across all platforms."
  },
  {
    icon: BarChart3,
    title: "Unified Reporting",
    description: "See all platform performance metrics in one comprehensive dashboard."
  },
  {
    icon: Clock,
    title: "Real-Time Sync",
    description: "Order status updates sync instantly across all connected platforms."
  },
  {
    icon: Shield,
    title: "Error Protection",
    description: "Automatic retry and failover ensures orders are never lost."
  }
];

// Platform logos from Simple Icons CDN
const platforms = [
  { name: "Uber Eats", logo: "https://cdn.simpleicons.org/ubereats/05C167" },
  { name: "DoorDash", logo: "https://cdn.simpleicons.org/doordash/FF3008" },
  { name: "Instacart", logo: "https://cdn.simpleicons.org/instacart/43B02A" },
  { name: "Deliveroo", logo: "https://cdn.simpleicons.org/deliveroo/00CCBC" },
  { name: "Foodpanda", logo: "https://cdn.simpleicons.org/foodpanda/D70F64" },
  { name: "Just Eat", logo: "https://cdn.simpleicons.org/justeat/F36D00" },
];

const benefits = [
  { value: "85%", label: "Less tablet clutter" },
  { value: "30min", label: "Average setup time" },
  { value: "99.9%", label: "Order accuracy" },
  { value: "$0", label: "Extra hardware cost" },
];

export default function DeliveryIntegrationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-orange-900 via-orange-800 to-teal-900 py-20 lg:py-28">
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
            className="inline-flex items-center gap-2 text-orange-300 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Technology
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300 mb-6">
                <Tablet className="h-4 w-4" />
                Delivery Integration Suite
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                One Tablet.<br />All Platforms.<br />Zero Chaos.
              </h1>
              
              <p className="text-xl text-orange-100/80 mb-8">
                Stop juggling multiple tablets and missed orders. Our delivery integration suite consolidates 
                Uber Eats, DoorDash, Grubhub, and more into a single, powerful dashboard.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-orange-900 hover:bg-orange-50 transition"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-orange-400 px-6 py-3 font-semibold text-white hover:bg-orange-800 transition"
                >
                  Schedule Demo
                </Link>
              </div>
            </div>
            
            {/* Platform logos grid */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {platforms.map((platform, idx) => (
                <div 
                  key={idx}
                  className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition"
                >
                  <img 
                    src={platform.logo} 
                    alt={platform.name}
                    className="w-12 h-12 mx-auto mb-3"
                  />
                  <span className="text-white font-medium">{platform.name}</span>
                </div>
              ))}
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
                <div className="text-3xl lg:text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our delivery integration suite handles the complexity so you can focus on making great food.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Connect Your Accounts", desc: "Link your existing delivery platform accounts in minutes. No coding required." },
              { step: 2, title: "Configure Your Workflow", desc: "Set up auto-accept rules, routing preferences, and notification settings." },
              { step: 3, title: "Start Receiving Orders", desc: "All orders flow into one dashboard. Accept, track, and manage effortlessly." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Delivery Operations?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join 500+ restaurants already saving time and reducing errors with our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-orange-500 hover:bg-orange-50 transition"
            >
              Get Your Free Quote
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
