"use client";

import Link from "next/link";
import {
  Tag,
  Percent,
  Gift,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

const pricingFeatures = [
  {
    title: "Price Lists",
    description: "Create custom price lists for different customer segments",
    href: "/admin/pricing/lists",
    icon: Tag,
    color: "orange",
    stats: { count: 5, label: "Active lists" },
  },
  {
    title: "Profit Margins",
    description: "Set and manage margins across all products",
    href: "/admin/pricing/margins",
    icon: Percent,
    color: "blue",
    stats: { count: "45%", label: "Avg margin" },
  },
  {
    title: "Discounts & Promotions",
    description: "Create discounts, coupons, and special offers",
    href: "/admin/pricing/discounts",
    icon: Gift,
    color: "purple",
    stats: { count: 12, label: "Active promos" },
  },
  {
    title: "Bulk Price Updates",
    description: "Import/export prices and update in bulk",
    href: "/admin/pricing/bulk",
    icon: FileSpreadsheet,
    color: "amber",
    stats: { count: "3.4K", label: "Products" },
  },
];

const recentChanges = [
  {
    product: "Takeout Container 32oz",
    change: "Price increased",
    from: "$0.79",
    to: "$0.89",
    date: "2 hours ago",
    type: "increase",
  },
  {
    product: "Paper Napkins (1000ct)",
    change: "Margin adjusted",
    from: "45%",
    to: "50%",
    date: "5 hours ago",
    type: "increase",
  },
  {
    product: "All Packaging",
    change: "Bulk update",
    from: "Various",
    to: "+5%",
    date: "1 day ago",
    type: "bulk",
  },
  {
    product: "Summer Sale",
    change: "Discount created",
    from: "-",
    to: "15% off",
    date: "2 days ago",
    type: "promo",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pricing Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your product pricing, margins, and promotions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">$127,450</p>
              <p className="text-sm text-slate-500">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">45.2%</p>
              <p className="text-sm text-slate-500">Average Margin</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2.5">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-500">Active Discounts</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">3,456</p>
              <p className="text-sm text-slate-500">Priced Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {pricingFeatures.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div
                className={`rounded-xl p-3 ${
                  feature.color === "orange"
                    ? "bg-orange-100"
                    : feature.color === "blue"
                    ? "bg-blue-100"
                    : feature.color === "purple"
                    ? "bg-purple-100"
                    : "bg-amber-100"
                }`}
              >
                <feature.icon
                  className={`h-6 w-6 ${
                    feature.color === "orange"
                      ? "text-orange-500"
                      : feature.color === "blue"
                      ? "text-blue-600"
                      : feature.color === "purple"
                      ? "text-purple-600"
                      : "text-amber-600"
                  }`}
                />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{feature.description}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-2xl font-bold text-slate-900">
                {feature.stats.count}
              </span>
              <span className="text-sm text-slate-500">
                {feature.stats.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Changes */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recent Price Changes</h2>
          <Link
            href="/admin/pricing/history"
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentChanges.map((change, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    change.type === "increase"
                      ? "bg-orange-100"
                      : change.type === "bulk"
                      ? "bg-blue-100"
                      : "bg-purple-100"
                  }`}
                >
                  {change.type === "increase" ? (
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  ) : change.type === "bulk" ? (
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Gift className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{change.product}</p>
                  <p className="text-sm text-slate-500">{change.change}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  <span className="text-slate-400 line-through">
                    {change.from}
                  </span>{" "}
                  <span className="font-semibold text-orange-500">
                    {change.to}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{change.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
