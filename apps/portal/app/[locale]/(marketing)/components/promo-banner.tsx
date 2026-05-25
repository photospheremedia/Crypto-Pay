"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Zap } from "lucide-react";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-linear-to-r from-emerald-500 via-emerald-500 to-purple-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2.5 text-center text-sm">
        <Zap className="h-4 w-4 animate-pulse" />
        <span>
          <strong>Limited time:</strong> Get 2 months free when you sign up for
          annual billing.
        </span>
        <Link
          href="/signup"
          className="ml-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/30"
        >
          Claim offer →
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
