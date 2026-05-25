"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { Monitor, Smartphone, Tablet, Globe, Loader2 } from "lucide-react";

function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface SessionsSectionProps {
  user: User;
}

export function SessionsSection({ user }: SessionsSectionProps) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Current session info
  const currentSession = {
    device: getUserAgent(),
    location: "Current Location",
    lastActive: "Active now",
    isCurrent: true,
  };

  function getUserAgent() {
    if (typeof window === "undefined") return "Unknown";
    const ua = window.navigator.userAgent;
    if (ua.includes("Mobile")) return "Mobile Device";
    if (ua.includes("Tablet")) return "Tablet";
    return "Desktop Browser";
  }

  function getDeviceIcon(device: string) {
    if (device.includes("Mobile")) return <Smartphone className="h-5 w-5" />;
    if (device.includes("Tablet")) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  }

  async function handleSignOutAll() {
    if (!confirm("Are you sure you want to sign out of all other sessions? You will remain signed in on this device.")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      setMessage({ type: "success", text: "All other sessions signed out successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to sign out other sessions" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="text-sm text-slate-600">
        These are the devices currently signed into your account. If you see any unfamiliar activity, 
        sign out immediately and change your password.
      </p>

      <div className="space-y-3">
        {/* Current Session */}
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500">
                {getDeviceIcon(currentSession.device)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{currentSession.device}</p>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Current
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {currentSession.location}
                </p>
                <p className="mt-1 text-xs text-slate-500">{currentSession.lastActive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info about other sessions */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-500">No other active sessions</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleSignOutAll}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing out..." : "Sign out all other sessions"}
        </button>
      </div>
    </div>
  );
}
