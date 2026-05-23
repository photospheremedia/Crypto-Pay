"use client";

import Link from "next/link";
import { ChevronLeft, FileSpreadsheet, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingHistory = [
  {
    id: "chg-1",
    product: "Takeout Container 32oz",
    action: "Price increased",
    before: "$0.79",
    after: "$0.89",
    by: "Admin Team",
    at: "2 hours ago",
    type: "increase",
  },
  {
    id: "chg-2",
    product: "Paper Napkins (1000ct)",
    action: "Margin adjusted",
    before: "45%",
    after: "50%",
    by: "Pricing Manager",
    at: "5 hours ago",
    type: "increase",
  },
  {
    id: "chg-3",
    product: "Packaging Collection",
    action: "Bulk update",
    before: "Various",
    after: "+5%",
    by: "Bulk Import",
    at: "Yesterday",
    type: "bulk",
  },
  {
    id: "chg-4",
    product: "Summer Promo",
    action: "Discount created",
    before: "N/A",
    after: "15% off",
    by: "Marketing Admin",
    at: "2 days ago",
    type: "promo",
  },
];

function iconByType(type: string) {
  if (type === "bulk") return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
  if (type === "promo") return <Gift className="h-4 w-4 text-purple-600" />;
  return <TrendingUp className="h-4 w-4 text-orange-500" />;
}

export default function PricingHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/pricing"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Pricing History</h1>
          <p className="text-sm text-slate-500">Recent changes to product prices, discounts, and margin rules.</p>
        </div>
        <Button asChild>
          <Link href="/admin/pricing">Open Pricing Dashboard</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
          Latest {pricingHistory.length} updates
        </div>
        <div className="divide-y divide-slate-100">
          {pricingHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-100 p-2">{iconByType(item.type)}</span>
                <div>
                  <p className="font-medium text-slate-900">{item.product}</p>
                  <p className="text-sm text-slate-600">{item.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-700">
                  <span className="text-slate-400 line-through">{item.before}</span>{" "}
                  <span className="font-semibold text-orange-500">{item.after}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {item.by} · {item.at}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
