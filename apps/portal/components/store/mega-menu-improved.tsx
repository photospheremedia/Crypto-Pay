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
  Percent,
  TrendingUp,
  Users,
  Briefcase,
  Clock
} from "lucide-react";

/**
 * Improved MegaMenu - Benefits-First Organization
 * 
 * Key improvements over original:
 * 1. Organize by BENEFITS, not just features
 *    - Boost Revenue (delivery consolidation, direct ordering)
 *    - Manage Operations (POS, analytics, supply chain)
 *    - Support Staff (training, onboarding, support)
 * 2. Include ROI metrics and quick stats
 * 3. Add value propositions to each item
 * 4. Clear visual hierarchy
 */

// Organized by BENEFITS, not just features
const boostRevenueServices = [
  { 
    name: "Delivery Integration", 
    href: "/technology/delivery-integration", 
    description: "Consolidate 10+ delivery platforms into one tablet",
    icon: Zap,
    metric: "Save $18K/year"
  },
  { 
    name: "Direct Ordering", 
    href: "/technology/direct-ordering", 
    description: "Own branded website & app for commission-free orders",
    icon: Store,
    metric: "Keep 100%"
  },
  { 
    name: "Menu Management", 
    href: "/technology/menu-management", 
    description: "Sync menus across all platforms in seconds",
    icon: Briefcase,
    metric: "Save 2hrs/week"
  },
];

const manageOperationsServices = [
  { 
    name: "Supply Marketplace", 
    href: "/supplies", 
    description: "One-stop shop for packaging, labels, smallwares with bulk pricing",
    icon: Box,
    metric: "15-30% cheaper"
  },
  { 
    name: "POS Integration", 
    href: "/services/pos", 
    description: "Orders route to kitchen automatically with no manual entry",
    icon: Laptop,
    metric: "Real-time sync"
  },
  { 
    name: "Analytics & Insights", 
    href: "/technology/analytics", 
    description: "See what's working: peak hours, profit margins, best sellers",
    icon: BarChart3,
    metric: "Data-driven"
  },
];

const supportStaffServices = [
  { 
    name: "24/7 Expert Support", 
    href: "/services/support", 
    description: "Award-winning team available round-the-clock",
    icon: Headphones,
    metric: "<5min avg"
  },
  { 
    name: "Onboarding & Training", 
    href: "/services/training", 
    description: "We handle setup, staff training, and launch management",
    icon: Users,
    metric: "End-to-end"
  },
  { 
    name: "Marketing Support", 
    href: "/services/marketing", 
    description: "Drive more orders with email campaigns and loyalty programs",
    icon: Sparkles,
    metric: "35% avg lift"
  },
];

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

export function MegaMenuImproved() {
  const [activeMenu, setActiveMenu] = useState<"shop" | "solutions" | "support" | null>(null);
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

  const handleMouseEnter = useCallback((menu: "shop" | "solutions" | "support") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const ServiceItem = ({ service }: any) => {
    const Icon = service.icon;
    return (
      <Link
        href={service.href}
        className="group flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
      >
        <div className="p-2 bg-orange-100/50 rounded-lg group-hover:bg-orange-100 transition">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition">
            {service.name}
          </p>
          <p className="text-sm text-slate-600">{service.description}</p>
          <p className="text-xs font-semibold text-orange-600 mt-1">{service.metric}</p>
        </div>
      </Link>
    );
  };

  return (
    <div ref={menuRef} className="relative flex items-center gap-1">
      {/* Solutions (Benefit-Based) */}
      <div onMouseEnter={() => handleMouseEnter("solutions")} onMouseLeave={handleMouseLeave}>
        <button
          onClick={() => setActiveMenu(activeMenu === "solutions" ? null : "solutions")}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeMenu === "solutions"
              ? "text-orange-600 bg-orange-50" 
              : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Solutions</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === "solutions" ? "rotate-180" : ""}`} />
        </button>

        {/* Solutions Dropdown */}
        {activeMenu === "solutions" && (
          <div
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 mt-2 w-screen max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-8"
          >
            <div className="grid grid-cols-3 gap-8">
              {/* Boost Revenue */}
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 mb-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Boost Revenue</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Drive More Profit</h3>
                  <p className="text-sm text-slate-600 mt-1">Keep commission revenue, increase order value</p>
                </div>
                <div className="space-y-2">
                  {boostRevenueServices.map((service) => (
                    <ServiceItem key={service.name} service={service} />
                  ))}
                </div>
              </div>

              {/* Manage Operations */}
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 mb-2">
                    <BarChart3 className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Manage Operations</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Simplify Daily Work</h3>
                  <p className="text-sm text-slate-600 mt-1">Reduce manual tasks, gain visibility, save costs</p>
                </div>
                <div className="space-y-2">
                  {manageOperationsServices.map((service) => (
                    <ServiceItem key={service.name} service={service} />
                  ))}
                </div>
              </div>

              {/* Support & Success */}
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 mb-2">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">Support & Success</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">We've Got Your Back</h3>
                  <p className="text-sm text-slate-600 mt-1">Expert guidance, training, and 24/7 support</p>
                </div>
                <div className="space-y-2">
                  {supportStaffServices.map((service) => (
                    <ServiceItem key={service.name} service={service} />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">1,200+ restaurants</span> already use Crypto Pay to save money and simplify operations
              </p>
              <Link 
                href="/get-started"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold text-sm"
              >
                Book Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

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
          <span>Shop</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${activeMenu === "shop" ? "rotate-180" : ""}`} />
        </Link>

        {/* Shop Dropdown */}
        {activeMenu === "shop" && (
          <div
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 mt-2 w-screen max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-8"
          >
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Shop by Category</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {productCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.slug}
                      href={`/shop?category=${category.slug}`}
                      className="group flex flex-col items-start gap-2 p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition"
                    >
                      <Icon className="h-6 w-6 text-slate-700 group-hover:text-orange-600 transition" />
                      <p className="font-semibold text-slate-900 text-sm">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.count} items</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources/Help */}
      <Link
        href="/about"
        onClick={() => setActiveMenu(null)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:text-orange-600 hover:bg-slate-50 transition-colors"
      >
        Why Us
      </Link>

      <Link
        href="/pricing"
        onClick={() => setActiveMenu(null)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:text-orange-600 hover:bg-slate-50 transition-colors"
      >
        Pricing
      </Link>
    </div>
  );
}
