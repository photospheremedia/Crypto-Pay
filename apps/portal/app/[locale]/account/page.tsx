"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Wallet,
  Shield,
  Settings,
  Zap,
  Copy,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";
import { WalletLinkCard } from "./wallet-link-card";

type WalletProfile = {
  wallet_network: string;
  wallet_address: string;
  wallet_verified: boolean;
  updated_at: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [walletProfile, setWalletProfile] = useState<WalletProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("user_wallet_profiles")
          .select("wallet_network, wallet_address, wallet_verified, updated_at")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setWalletProfile(profile);
      }
      setLoading(false);
    })();
  }, []);

  function copyEmail() {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    );
  }

  const quickLinks = [
    {
      label: "Wallet Setup",
      href: "/account/get-started",
      icon: Wallet,
      description: "Connect your crypto wallet to start accepting payments",
      color: "text-emerald-500",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Security",
      href: "/account/security",
      icon: Shield,
      description: "Manage 2FA, sessions, and password",
      color: "text-blue-500",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: "Settings",
      href: "/account/settings",
      icon: Settings,
      description: "Account preferences and notifications",
      color: "text-slate-500",
      bg: "bg-slate-50 border-slate-100",
    },
    {
      label: "Support",
      href: "/account/support",
      icon: Zap,
      description: "Get help from our team",
      color: "text-purple-500",
      bg: "bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.user_metadata?.given_name || user?.email?.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your Crypto Pay merchant dashboard
          </p>
        </div>
        <button
          onClick={copyEmail}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          {copied ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {user?.email}
        </button>
      </div>

      {/* Wallet status */}
      <WalletLinkCard walletProfile={walletProfile} onSaved={setWalletProfile} />

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <p>
          Payment tracking is coming soon. Connect your wallet below to be ready when it launches.
        </p>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition hover:shadow-md ${item.bg}`}
            >
              <span className={`mt-0.5 rounded-lg p-2 bg-white shadow-sm ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition text-sm">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
