"use client";

import { useActionState, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { subscribeToNewsletter, type NewsletterState } from "../actions/newsletter";

interface NewsletterFormProps {
  variant?: "footer" | "inline" | "popup" | "sidebar";
  source?: string;
  listType?: string;
  showName?: boolean;
  showCompany?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterForm({
  variant = "footer",
  source = "website",
  listType = "weekly_ops_brief",
  showName = false,
  showCompany = false,
  title,
  description,
  className = "",
}: NewsletterFormProps) {
  const tCommon = useTranslations("Common");
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(
    subscribeToNewsletter,
    {}
  );
  const [email, setEmail] = useState("");

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      setEmail("");
    }
  }, [state.success]);

  if (state.success) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 ${className}`}>
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-sm font-medium text-emerald-800">{state.message}</p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`rounded-3xl border border-amber-100 bg-amber-50 px-6 py-5 ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">
              {title || "Weekly ops brief"}
            </p>
            <p className="font-semibold text-slate-900">
              {description || "Get new supply bundles and rollout playbooks."}
            </p>
          </div>
          <form action={formAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="source" value={source} />
            <input type="hidden" name="list_type" value={listType} />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition"
            >
              {pending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tCommon("subscribing")}
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </div>
        {state.error && (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900">
            {title || "Stay in the loop"}
          </h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {description || "Get weekly insights on business ops, delivery trends, and supply deals."}
        </p>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="list_type" value={listType} />
          {showName && (
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          )}
          {showCompany && (
            <input
              type="text"
              name="company_name"
              placeholder="Business / Company name"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          )}
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon("subscribing")}
              </>
            ) : (
              "Subscribe for free"
            )}
          </button>
        </form>
        {state.error && (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Unsubscribe anytime. No spam, ever.
        </p>
      </div>
    );
  }

  if (variant === "popup" || variant === "sidebar") {
    return (
      <div className={`rounded-3xl bg-linear-to-br from-emerald-500 to-cyan-600 p-6 text-white shadow-xl ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-100">
            Free Weekly Newsletter
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">
          {title || "Business Ops Weekly"}
        </h3>
        <p className="text-sm text-emerald-100 mb-4">
          {description || "Join 500+ business operators getting weekly tips on delivery optimization, supply savings, and growth strategies."}
        </p>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="list_type" value={listType} />
          {showName && (
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-emerald-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          )}
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-2.5 text-sm text-white placeholder:text-emerald-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tCommon("joining")}
              </>
            ) : (
              "Join for free →"
            )}
          </button>
        </form>
        {state.error && (
          <p className="mt-2 text-sm text-red-200">{state.error}</p>
        )}
        <p className="mt-3 text-xs text-emerald-200 text-center">
          ✓ Free forever &nbsp;•&nbsp; ✓ Unsubscribe anytime
        </p>
      </div>
    );
  }

  return null;
}
