"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  ChevronRight,
  PackageSearch, 
  Sparkles, 
  BarChart3,
  Box,
  UtensilsCrossed,
  Tag,
  Coffee,
  ShoppingBag,
  Armchair,
  Shield,
  ChefHat,
  ArrowRight,
  Zap,
  Store,
  Laptop,
  Headphones,
  Percent
} from "lucide-react";

// Product categories - clean text-only design
const productCategories = [
  { name: "Packaging & Takeout", slug: "packaging-takeout", icon: Box, count: "1,245" },
  { name: "Cutlery & Utensils", slug: "cutlery-utensils", icon: UtensilsCrossed, count: "589" },
  { name: "Beverages & Cups", slug: "beverages-cups", icon: Coffee, count: "678" },
  { name: "Labels & Stickers", slug: "labels-stickers", icon: Tag, count: "456" },
  { name: "Kitchen Equipment", slug: "kitchen-equipment", icon: ChefHat, count: "892" },
  { name: "Cleaning & Safety", slug: "cleaning-safety", icon: Shield, count: "567" },
  { name: "Paper Products", slug: "paper-products", icon: ShoppingBag, count: "723" },
  { name: "Furniture & Fixtures", slug: "furniture-fixtures", icon: Armchair, count: "345" },
];

// Services data
const servicesData = [
  { name: "Delivery Integration", href: "/technology/delivery-integration", description: "Unified platform for all delivery apps", icon: Zap },
  { name: "Menu Management", href: "/technology/menu-management", description: "Sync menus across platforms", icon: Store },
  { name: "Analytics & Insights", href: "/technology/analytics", description: "Real-time data & reports", icon: BarChart3 },
  { name: "POS Integration", href: "/services/pos", description: "Seamless order routing", icon: Laptop },
  { name: "Marketing Support", href: "/services/marketing", description: "Drive more orders", icon: Sparkles },
  { name: "24/7 Support", href: "/services/support", description: "Expert help anytime", icon: Headphones },
];

export function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<"shop" | "services" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleMouseEnter = useCallback((menu: "shop" | "services") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div ref={menuRef} className="relative flex items-center gap-1">
      {/* Shop Link */}
      <div onMouseEnter={() => handleMouseEnter("shop")} onMouseLeave={handleMouseLeave}>
        <Link
          href="/shop"
          onClick={() => setActiveMenu(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeMenu === "shop"
              ? "text-orange-600 bg-orange-50" 
              : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
          }`}
        >
          <PackageSearch className="h-4 w-4" />
          <span className="flex flex-col leading-none">
            <span>Shop</span>
            <span className="mt-0.5 w-fit rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
              Beta
            </span>
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === "shop" ? "rotate-180" : ""}`} />
        </Link>
      </div>

      {/* Services Link */}
      <div onMouseEnter={() => handleMouseEnter("services")} onMouseLeave={handleMouseLeave}>
        <Link
          href="/services"
          onClick={() => setActiveMenu(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeMenu === "services"
              ? "text-orange-600 bg-orange-50" 
              : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Services</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === "services" ? "rotate-180" : ""}`} />
        </Link>
      </div>

      {/* Integrations Link - New */}
      <Link
        href="/integrations"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-slate-700 hover:text-orange-600 hover:bg-slate-50"
      >
        <Zap className="h-4 w-4" />
        <span>Integrations</span>
      </Link>

      {/* ═══════════════════════════════════════════════════════════════
          SHOP DROPDOWN - Clean List Design
      ═══════════════════════════════════════════════════════════════ */}
      {activeMenu === "shop" && (
        <div
          className="absolute left-0 top-full pt-2 z-50"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-[520px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2">
              {/* Categories List */}
              <div className="p-4 border-r border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  Categories
                </div>
                <nav className="space-y-0.5">
                  {productCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/shop/category/${cat.slug}`}
                        onClick={() => setActiveMenu(null)}
                        className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-orange-100 transition-colors">
                          <Icon className="h-4 w-4 text-slate-500 group-hover:text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 group-hover:text-orange-600">
                            {cat.name}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{cat.count}</span>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right Panel - Deals & Featured */}
              <div className="p-4 bg-slate-50/50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Featured
                </div>
                
                {/* Deal Card */}
                <div className="bg-orange-500 rounded-lg p-4 text-white mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">Bulk Discount</span>
                  </div>
                  <div className="text-lg font-bold mb-1">25% Off Orders $500+</div>
                  <p className="text-xs text-orange-100 mb-3">Limited time savings on bulk orders</p>
                  <Link
                    href="/shop?promo=bulk25"
                    onClick={() => setActiveMenu(null)}
                    className="inline-block px-3 py-1.5 bg-white text-orange-600 text-xs font-semibold rounded-md hover:bg-orange-50 transition"
                  >
                    Shop Deals
                  </Link>
                </div>

                {/* Quick Links */}
                <div className="space-y-2">
                  <Link
                    href="/shop?filter=new"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-500"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    New Arrivals
                  </Link>
                  <Link
                    href="/shop?filter=bestseller"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-500"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Best Sellers
                  </Link>
                  <Link
                    href="/shop?filter=eco"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-500"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Eco-Friendly
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/shop"
                onClick={() => setActiveMenu(null)}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                Browse All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-slate-400">5,000+ products</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SERVICES DROPDOWN
      ═══════════════════════════════════════════════════════════════ */}
      {activeMenu === "services" && (
        <div
          className="absolute left-0 top-full pt-2 z-50"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleMouseLeave}
          style={{ left: "80px" }}
        >
          <div className="w-[420px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Technology & Services
              </div>
              <div className="grid grid-cols-2 gap-1">
                {servicesData.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.href}
                      href={service.href}
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <div className="text-sm font-medium text-slate-800 group-hover:text-orange-600">
                          {service.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {service.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/technology"
                onClick={() => setActiveMenu(null)}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                Explore All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
