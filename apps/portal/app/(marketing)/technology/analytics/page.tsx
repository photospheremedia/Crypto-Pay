"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ArrowLeft,
  LineChart,
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  Clock,
  DollarSign,
  Users,
  ShoppingBag
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Sales Trend Analysis",
    description: "Track daily, weekly, and monthly sales patterns across all channels and locations."
  },
  {
    icon: Clock,
    title: "Peak Hour Identification",
    description: "Know exactly when your busiest times are to optimize staffing and prep."
  },
  {
    icon: ShoppingBag,
    title: "Menu Performance",
    description: "See which items sell best, have highest margins, and need attention."
  },
  {
    icon: Users,
    title: "Customer Insights",
    description: "Understand ordering patterns, repeat customers, and average order values."
  },
  {
    icon: PieChart,
    title: "Platform Breakdown",
    description: "Compare performance across Uber Eats, DoorDash, direct orders, and more."
  },
  {
    icon: Download,
    title: "Export & Reports",
    description: "Schedule automated reports and export data for accounting and analysis."
  }
];

const metrics = [
  { label: "Total Revenue", value: "$847,293", change: "+12.4%" },
  { label: "Orders", value: "12,847", change: "+8.2%" },
  { label: "Avg Order Value", value: "$65.93", change: "+3.1%" },
  { label: "Repeat Customers", value: "67%", change: "+5.4%" },
];

const benefits = [
  { value: "Real-time", label: "Data updates" },
  { value: "50+", label: "Report templates" },
  { value: "All", label: "Platforms unified" },
  { value: "Custom", label: "Dashboard views" },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-violet-900 via-purple-800 to-indigo-900 py-20 lg:py-28">
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
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Technology
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300 mb-6">
                <LineChart className="h-4 w-4" />
                Analytics & Insights
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Data-Driven<br />Decisions Made<br />Simple.
              </h1>
              
              <p className="text-xl text-purple-100/80 mb-8">
                Stop guessing. Get real-time insights into your sales, customers, and operations 
                with comprehensive analytics designed for restaurants.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-purple-900 hover:bg-purple-50 transition"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-purple-400 px-6 py-3 font-semibold text-white hover:bg-purple-800 transition"
                >
                  See Live Demo
                </Link>
              </div>
            </div>
            
            {/* Mock dashboard */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">This Month</h3>
                  <select className="text-sm border rounded-lg px-3 py-1.5">
                    <option>Last 30 days</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4">
                      <div className="text-sm text-slate-500 mb-1">{metric.label}</div>
                      <div className="text-xl font-bold text-slate-900">{metric.value}</div>
                      <div className="text-sm text-orange-500">{metric.change}</div>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-linear-to-r from-purple-100 to-indigo-100 rounded-xl flex items-end p-4 gap-2">
                  {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-purple-500 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
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
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
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
              Complete Visibility Into Your Business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From high-level trends to granular details, get the insights you need to grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Powerful Yet Simple
            </h2>
            <p className="text-lg text-slate-600">
              Complex analytics made accessible for busy restaurant operators
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-sm text-slate-400 ml-4">Crypto Pay Analytics</span>
            </div>
            <div className="p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-slate-900 mb-4">Revenue by Platform</h4>
                  <div className="h-64 bg-linear-to-br from-slate-50 to-purple-50 rounded-xl flex items-end p-6 gap-4">
                    {[
                      { label: "Direct", height: 85, color: "bg-orange-500" },
                      { label: "Uber Eats", height: 65, color: "bg-green-400" },
                      { label: "DoorDash", height: 55, color: "bg-red-400" },
                      { label: "Grubhub", height: 35, color: "bg-orange-400" },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full ${bar.color} rounded-t-lg`}
                          style={{ height: `${bar.height}%` }}
                        />
                        <span className="text-xs text-slate-500 mt-2">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Top Items</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Signature Burger", sales: 847 },
                      { name: "Caesar Salad", sales: 623 },
                      { name: "Margherita Pizza", sales: 589 },
                      { name: "Chicken Wings", sales: 512 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-semibold text-slate-900">{item.sales}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Start Making Data-Driven Decisions
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Get instant access to the insights that matter most for your restaurant.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-purple-600 hover:bg-purple-50 transition"
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
