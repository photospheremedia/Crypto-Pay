"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  PackageSearch,
  Wrench,
  BarChart3,
  Users,
  Phone,
  LogOut,
  Settings,
  Package,
  UserRound,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useWishlist } from "./wishlist-context";
import { useCart } from "./cart-context";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthed: boolean | undefined;
  onSignOut: () => void;
}

const menuSections = [
  {
    title: "Services",
    icon: Sparkles,
    items: [
      { label: "Delivery Integration", href: "/services/delivery" },
      { label: "Menu & Branding", href: "/services/branding" },
      { label: "POS Integration", href: "/services/pos" },
      { label: "Marketing Support", href: "/services/marketing" },
    ],
  },
  {
    title: "Supplies",
    icon: PackageSearch,
    items: [
      { label: "Packaging", href: "/shop?category=packaging" },
      { label: "Labels & Stickers", href: "/shop?category=labels" },
      { label: "Smallwares", href: "/shop?category=smallwares" },
      { label: "All Supplies", href: "/shop" },
    ],
  },
  {
    title: "Solutions",
    icon: Wrench,
    items: [
      { label: "Multi-Location", href: "/solutions/multi-location" },
      { label: "Dark Kitchen", href: "/solutions/dark-kitchen" },
      { label: "Franchise Support", href: "/solutions/franchise" },
    ],
  },
];

const quickLinks = [
  { label: "Pricing", href: "/pricing", icon: BarChart3 },
  { label: "About Us", href: "/about", icon: Users },
  { label: "Contact", href: "/contact", icon: Phone },
];

export function MobileMenu({ isOpen, onClose, isAuthed, onSignOut }: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { itemCount: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl lg:hidden overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search supplies, services..."
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Prominent Shop Button */}
          <div className="p-4 border-b border-slate-100">
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center justify-between w-full rounded-xl bg-linear-to-r from-orange-500 to-orange-600 p-4 text-white shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <PackageSearch className="h-6 w-6" />
                <div>
                  <span className="block text-lg font-bold">Shop All Supplies</span>
                  <span className="text-xs text-orange-100">Packaging, Equipment & More</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Quick Actions - Cart & Wishlist */}
          <div className="p-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl bg-red-50 p-3 text-red-700 hover:bg-red-100 transition-colors"
              >
                <Heart className="h-5 w-5" />
                <div>
                  <span className="text-sm font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl bg-orange-50 p-3 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <div>
                  <span className="text-sm font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-2 text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-4 border-b border-slate-100">
            <div className="grid grid-cols-3 gap-2">
              {quickLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors ${
                    pathname === href
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Menu Sections */}
          <nav className="flex-1 p-4 space-y-6">
            {menuSections.map(({ title, icon: Icon, items }) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Icon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {title}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
                        pathname === item.href || pathname?.startsWith(item.href.split("?")[0])
                          ? "bg-orange-100 text-orange-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-100 p-4 mt-auto">
            {isAuthed === undefined ? (
              <div className="space-y-2">
                <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ) : isAuthed ? (
              <div className="space-y-2">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">Account Settings</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Package className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">My Orders</span>
                </Link>
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                >
                  <UserRound className="h-5 w-5" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
