"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/store/cart-context";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartPageClient() {
  const { items, updateQuantity, removeItem, subtotalCents, clear } = useCart();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
              Cart & quote
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Review your supply cart
            </h1>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900"
          >
            Clear cart
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Browse supplies
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {formatMoney(item.priceCents)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoney(item.priceCents * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            How quotes work
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Submit your cart to receive a custom quote, shipping estimate, and
            fulfillment timeline. Our team will confirm availability and handle
            supplier coordination for you.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• Receive a detailed quote within one business day.</li>
            <li>• Approve and pay one-time or convert to subscription.</li>
            <li>• Track deliveries and reorders inside your account.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-orange-200 bg-orange-50/70 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Cart total
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {formatMoney(subtotalCents)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Shipping and tax calculated at checkout.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600 transition"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/account/quotes"
              className="flex w-full items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
            >
              Request a Quote Instead
            </Link>
            <Link
              href="/shop"
              className="flex w-full items-center justify-center text-sm font-medium text-slate-600 hover:text-orange-500 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
