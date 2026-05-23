"use client";

import { useState } from "react";
import { useCart } from "@/components/store/cart-context";
import {
  ShoppingCart,
  Check,
  Eye,
  X,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  Leaf,
  Award,
} from "lucide-react";

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  badge?: string;
};

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const badgeIcons: Record<string, React.ReactNode> = {
  "Top pick": <TrendingUp className="h-3 w-3" />,
  "Best value": <Sparkles className="h-3 w-3" />,
  Eco: <Leaf className="h-3 w-3" />,
  "Pro pick": <Award className="h-3 w-3" />,
};

const badgeColors: Record<string, string> = {
  "Top pick": "bg-amber-100 text-amber-700 border-amber-200",
  "Best value": "bg-green-100 text-green-700 border-green-200",
  Eco: "bg-orange-100 text-orange-600 border-orange-200",
  "Pro pick": "bg-blue-100 text-blue-700 border-blue-200",
};

export default function ShopGrid({ items }: { items: ShopItem[] }) {
  const { addItem, items: cartItems } = useCart();
  const [added, setAdded] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [quickViewItem, setQuickViewItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const categories = [
    "All",
    ...Array.from(new Set(items.map((item) => item.category))),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleAdd = (item: ShopItem, qty: number = 1) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        category: item.category,
      },
      qty
    );
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1400);
  };

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find((i) => i.id === itemId);
    return cartItem?.quantity || 0;
  };

  const openQuickView = (item: ShopItem) => {
    setQuickViewItem(item);
    setQuantity(1);
  };

  return (
    <>
      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200/60"
                : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-slate-500">
        Showing {filteredItems.length} items
        {selectedCategory !== "All" && ` in ${selectedCategory}`}
      </p>

      {/* Product grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const inCart = getCartQuantity(item.id);
          const isAdded = added === item.id;

          return (
            <div
              key={item.id}
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/50"
            >
              {/* Badge */}
              {item.badge && (
                <span
                  className={`absolute -top-2 left-4 flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    badgeColors[item.badge] || "bg-orange-100 text-orange-600 border-orange-200"
                  }`}
                >
                  {badgeIcons[item.badge]}
                  {item.badge}
                </span>
              )}

              {/* Quick view button */}
              <button
                onClick={() => openQuickView(item)}
                className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 opacity-0 transition-all duration-200 hover:bg-orange-100 hover:text-orange-500 group-hover:opacity-100"
                aria-label={`Quick view ${item.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* Category */}
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
                {item.category}
              </p>

              {/* Name */}
              <h3 className="mt-3 text-lg font-semibold text-slate-900 transition-colors group-hover:text-orange-600">
                {item.name}
              </h3>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {item.description}
              </p>

              {/* Price & Cart */}
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-slate-900">
                    {formatMoney(item.priceCents)}
                  </span>
                  {inCart > 0 && (
                    <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {inCart} in cart
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  disabled={isAdded}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                    isAdded
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600 hover:scale-105"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick view modal */}
      {quickViewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setQuickViewItem(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewItem(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              aria-label="Close quick view"
            >
              <X className="h-5 w-5" />
            </button>

            {quickViewItem.badge && (
              <span
                className={`mb-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  badgeColors[quickViewItem.badge] ||
                  "bg-orange-100 text-orange-600 border-orange-200"
                }`}
              >
                {badgeIcons[quickViewItem.badge]}
                {quickViewItem.badge}
              </span>
            )}

            <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
              {quickViewItem.category}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {quickViewItem.name}
            </h2>
            <p className="mt-3 text-slate-600">{quickViewItem.description}</p>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatMoney(quickViewItem.priceCents)}
                </p>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full border border-slate-200 p-2 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-lg font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full border border-slate-200 p-2 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={() => {
                  handleAdd(quickViewItem, quantity);
                  setQuickViewItem(null);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-orange-600"
              >
                <ShoppingCart className="h-4 w-4" />
                Add {quantity} to cart — {formatMoney(quickViewItem.priceCents * quantity)}
              </button>
              <button
                onClick={() => setQuickViewItem(null)}
                className="rounded-full border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
