"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { useRecentlyViewed } from "@/components/store/recently-viewed-context";
import { useCart } from "@/components/store/cart-context";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

interface RecentlyViewedSectionProps {
  maxItems?: number;
  excludeId?: string;
}

export function RecentlyViewedSection({ maxItems = 6, excludeId }: RecentlyViewedSectionProps) {
  const { items } = useRecentlyViewed();
  const { addItem } = useCart();

  const filteredItems = items
    .filter((item) => item.id !== excludeId)
    .slice(0, maxItems);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Recently Viewed</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            href={`/shop/product/${item.id}`}
            className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-orange-200 transition-all"
          >
            <div className="relative aspect-square bg-slate-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-slate-300" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-orange-500 transition">
                {item.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-orange-500">
                {formatMoney(item.priceCents)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
