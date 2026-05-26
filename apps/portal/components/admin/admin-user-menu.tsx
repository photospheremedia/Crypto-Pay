"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { Settings, LogOut, Shield, Crown, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOutAdmin } from "@/app/[locale]/(login)/actions";

interface AdminUserMenuProps {
  isSuperAdmin?: boolean;
}

export function AdminUserMenu({ isSuperAdmin }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user ? { email: data.user.email!, name: data.user.user_metadata?.full_name } : null);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium ring-2 ring-emerald-100 hover:ring-emerald-200 transition-all"
        aria-label="Open user menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[200] mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 fade-in-0">
          {/* User Info */}
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            {isSuperAdmin && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                <Crown className="h-3 w-3" />
                Super Admin
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/admin/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Shield className="h-4 w-4 text-slate-400" />
              Security
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Admin Settings
            </Link>
            {isSuperAdmin && (
              <Link
                href="/admin/staff"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Shield className="h-4 w-4 text-purple-500" />
                Staff Management
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-200 py-2">
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
