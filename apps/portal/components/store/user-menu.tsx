"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserRound, LogOut, Settings, Package, HelpCircle, ChevronDown } from "lucide-react";

interface UserMenuProps {
  isAuthed: boolean | undefined;  // undefined = loading state
  userData: {
    email: string | null;
    name: string | null;
    avatar: string | null;
  } | null;
  onSignOut: () => void;
}

export function UserMenu({ isAuthed, userData, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
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

  // Reset avatar error when avatar URL changes
  useEffect(() => {
    setAvatarError(false);
  }, [userData?.avatar]);

  // Loading state - show skeleton with same dimensions as "Sign in" button to prevent layout shift
  if (isAuthed === undefined) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 animate-pulse min-w-24">
        <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
        <div className="h-4 w-11 rounded bg-slate-200" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
      >
        <UserRound className="h-4 w-4 text-orange-500" />
        Sign in
      </Link>
    );
  }

  const userName = userData?.name;
  const userEmail = userData?.email;
  const avatar = userData?.avatar;

  const initials = userName
    ? userName
        .split(/[\s._-]/)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
      >
        {avatar && !avatarError ? (
          <img
            src={avatar}
            alt="Profile"
            className="h-6 w-6 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
            {initials}
          </div>
        )}
        <span className="hidden md:inline">{userName || "Account"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 fade-in-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              {userName || "Account"}
            </p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
          <div className="p-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-orange-50"
            >
              <UserRound className="h-4 w-4 text-orange-500" />
              Dashboard
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-orange-50"
            >
              <Package className="h-4 w-4 text-orange-500" />
              Orders & Quotes
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-orange-50"
            >
              <Settings className="h-4 w-4 text-orange-500" />
              Settings
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-orange-50"
            >
              <HelpCircle className="h-4 w-4 text-orange-500" />
              Support
            </Link>
          </div>
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
