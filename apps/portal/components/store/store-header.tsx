"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, Heart } from "lucide-react";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { UserMenu } from "./user-menu";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { AnnouncementBar } from "./announcement-bar";
import { SearchDropdown } from "./search-dropdown";
import { Logo } from "../logo";
import { Store } from "lucide-react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// Quick access links for common actions
const quickLinks = [
  { label: "Shop", href: "/shop", icon: Store },
];

export function StoreHeader() {
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  // Use undefined to indicate "loading" state - prevents hydration flicker
  const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);
  const [userData, setUserData] = useState<{
    email: string | null;
    name: string | null;
    avatar: string | null;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (data.user) {
        const name = data.user.user_metadata?.given_name || 
                    data.user.user_metadata?.full_name?.split(' ')[0] || 
                    data.user.email?.split('@')[0];
        setUserData({
          email: data.user.email || null,
          name: name || null,
          avatar: data.user.user_metadata?.avatar_url || null,
        });
        setIsAuthed(true);
      } else {
        setUserData(null);
        setIsAuthed(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        const name = session.user.user_metadata?.given_name || 
                    session.user.user_metadata?.full_name?.split(' ')[0] || 
                    session.user.email?.split('@')[0];
        setUserData({
          email: session.user.email || null,
          name: name || null,
          avatar: session.user.user_metadata?.avatar_url || null,
        });
        setIsAuthed(true);
      } else {
        setUserData(null);
        setIsAuthed(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setIsAuthed(false);
    window.location.href = "/";
  };

  return (
    <>
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      
      <header className="sticky left-0 right-0 top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
        {/* Announcement Bar */}
        <AnnouncementBar />

        {/* Main Header - Full Width with Edge-to-Edge Layout */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 min-w-0">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
              <Logo size="md" showText={true} />
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
                <MegaMenu />
              </nav>
            </div>

            {/* Center Section: Search - Takes Available Space */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-4">
              <SearchDropdown />
            </div>

            {/* Right Section: Actions - Flexible Width */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search - Mobile & Tablet */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist - Always visible (works for guests via localStorage) */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full border border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <UserMenu isAuthed={isAuthed} userData={userData} onSignOut={handleSignOut} />
            
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-2 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              <span className="hidden sm:inline text-sm font-medium text-slate-700">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        isAuthed={isAuthed}
        onSignOut={handleSignOut}
      />
    </>
  );
}
