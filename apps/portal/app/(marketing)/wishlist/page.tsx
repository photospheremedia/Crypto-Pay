"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/store/wishlist-context";
import { useCart } from "@/components/store/cart-context";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      priceCents: item.priceCents,
      image: item.image,
    });
    removeItem(item.id);
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        image: item.image,
      });
    });
    clear();
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50">
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-600">
                  Saved items
                </p>
                <h1 className="mt-1 text-3xl font-semibold text-slate-900">
                  My Wishlist
                </h1>
              </div>
            </div>
            {items.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleMoveAllToCart}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add All to Cart
                </button>
                <button
                  onClick={clear}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 px-4 py-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product. 
              They'll appear here for easy access later.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-slate-600">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
              <p className="text-sm text-slate-600">
                Total value: <span className="font-semibold text-slate-900">
                  {formatMoney(items.reduce((sum, item) => sum + item.priceCents, 0))}
                </span>
              </p>
            </div>

            {/* Items Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all"
                >
                  <Link href={`/shop/product/${item.id}`}>
                    <div className="relative aspect-square bg-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Heart className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/shop/product/${item.id}`}>
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-500 transition line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {formatMoney(item.priceCents)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Added {formatDate(item.addedAt)}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Continue Shopping */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
