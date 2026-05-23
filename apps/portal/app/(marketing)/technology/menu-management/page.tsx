"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ArrowLeft,
  Settings,
  RefreshCw,
  Image,
  DollarSign,
  Clock,
  CheckCircle,
  Layers,
  ToggleRight,
  Zap,
  Cloud
} from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "One-Click Sync",
    description: "Update your menu once and automatically sync changes to all connected platforms."
  },
  {
    icon: DollarSign,
    title: "Price Management",
    description: "Set different prices per platform or apply universal pricing across all channels."
  },
  {
    icon: ToggleRight,
    title: "Item Availability",
    description: "86 an item in seconds and it's instantly updated everywhere."
  },
  {
    icon: Image,
    title: "Photo Optimization",
    description: "Upload once and we'll automatically resize and optimize for each platform."
  },
  {
    icon: Layers,
    title: "Modifier Management",
    description: "Handle complex modifiers, combos, and customizations across all platforms."
  },
  {
    icon: Clock,
    title: "Scheduled Changes",
    description: "Plan menu updates in advance. Launch seasonal items automatically."
  }
];

const platforms = [
  { name: "Uber Eats", logo: "https://cdn.simpleicons.org/ubereats/05C167" },
  { name: "DoorDash", logo: "https://cdn.simpleicons.org/doordash/FF3008" },
  { name: "Instacart", logo: "https://cdn.simpleicons.org/instacart/43B02A" },
  { name: "Foodpanda", logo: "https://cdn.simpleicons.org/foodpanda/D70F64" },
  { name: "Website", logo: "https://cdn.simpleicons.org/googlechrome/4285F4" },
  { name: "POS", logo: "https://cdn.simpleicons.org/square/000000" },
];

const benefits = [
  { value: "5 min", label: "To update all menus" },
  { value: "100%", label: "Sync accuracy" },
  { value: "6+", label: "Platforms supported" },
  { value: "24/7", label: "Auto-sync enabled" },
];

export default function MenuManagementPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-amber-900 via-orange-800 to-red-900 py-20 lg:py-28">
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
            className="inline-flex items-center gap-2 text-amber-300 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Technology
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-300 mb-6">
                <Settings className="h-4 w-4" />
                Menu Management
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Update Once.<br />Sync Everywhere.<br />Instantly.
              </h1>
              
              <p className="text-xl text-amber-100/80 mb-8">
                Stop wasting hours updating menus on every platform. Make changes once 
                and watch them sync automatically to Uber Eats, DoorDash, your website, and more.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-amber-900 hover:bg-amber-50 transition"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-amber-400 px-6 py-3 font-semibold text-white hover:bg-amber-800 transition"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
            
            {/* Sync visualization */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Center hub */}
                <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto relative z-10">
                  <Settings className="w-12 h-12 text-amber-600" />
                </div>
                
                {/* Orbiting platforms */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 border-2 border-dashed border-amber-400/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
                    {platforms.map((platform, idx) => (
                      <div 
                        key={idx}
                        className="absolute w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center"
                        style={{
                          transform: `rotate(${idx * 60}deg) translateY(-160px) rotate(-${idx * 60}deg)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <img 
                          src={platform.logo} 
                          alt={platform.name}
                          className="w-8 h-8"
                          title={platform.name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
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
                <div className="text-3xl lg:text-4xl font-bold text-amber-600 mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              The Menu Update Nightmare is Over
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-4">❌ Without Menu Management</h3>
              <ul className="space-y-3 text-red-800">
                <li>• Log into 5+ different platforms</li>
                <li>• Update each menu manually</li>
                <li>• Upload photos separately everywhere</li>
                <li>• Risk inconsistent pricing</li>
                <li>• Hours wasted every week</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-2xl p-8 border border-orange-200">
              <h3 className="text-xl font-bold text-orange-900 mb-4">✓ With Menu Management</h3>
              <ul className="space-y-3 text-orange-800">
                <li>• One dashboard for everything</li>
                <li>• Change once, sync everywhere</li>
                <li>• Photos auto-optimized</li>
                <li>• Consistent across all platforms</li>
                <li>• Updates take minutes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features, Simple Interface
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Take Control of Your Menus
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join businesses saving hours every week with automated menu management.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-amber-600 hover:bg-amber-50 transition"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
