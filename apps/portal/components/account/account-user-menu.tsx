"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/app/[locale]/(login)/actions";

export interface AccountUserMenuProps {
  email: string;
  displayName: string;
  initial: string;
}

export function AccountUserMenu({
  email,
  displayName,
  initial,
}: AccountUserMenuProps) {
  const t = useTranslations("Account.nav");
  const tHeader = useTranslations("Account.header");
  const [isOpen, setIsOpen] = useState(false);
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

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || initial;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-full bg-emerald-500 pl-1 pr-2 text-white ring-2 ring-emerald-100 transition-all hover:ring-emerald-200"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={tHeader("userMenu")}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium">
          {initials}
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 opacity-80 sm:block" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[200] mt-2 w-64 animate-in fade-in-0 slide-in-from-top-2 rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500">{email}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              {t("dashboard")}
            </Link>
            <Link
              href="/account/security"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Shield className="h-4 w-4 text-slate-400" />
              {t("security")}
            </Link>
            <Link
              href="/account/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              {t("settings")}
            </Link>
            <Link
              href="/account/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-400" />
              {tHeader("profile")}
            </Link>
          </div>

          <div className="border-t border-slate-200 py-2">
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
