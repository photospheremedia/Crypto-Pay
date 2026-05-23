"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeliveryPartners } from "./delivery-partners";

// Using Logo.dev API - the industry standard for company logos
const getLogoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;

// Platform domains for Logo.dev
const platformDomains: Record<string, string> = {
  "Uber Eats": "ubereats.com",
  "DoorDash": "doordash.com",
  "Deliveroo": "deliveroo.com",
  "Postmates": "postmates.com",
  "Grubhub": "grubhub.com",
  "Swiggy": "swiggy.com",
};

export function HeroWithVideo() {
  const [activeNotification, setActiveNotification] = useState(0);

  // Simulated live order notifications
  const notifications = [
    { platform: "DoorDash", platformColor: "bg-red-500", order: "2x Signature Burger", amount: "$24.50" },
    { platform: "Uber Eats", platformColor: "bg-orange-500", order: "1x Family Pizza Deal", amount: "$42.00" },
    { platform: "Deliveroo", platformColor: "bg-teal-500", order: "3x Taco Combo", amount: "$18.75" },
  ];

  // Rotate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotification((prev) => (prev + 1) % notifications.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [notifications.length]);

  // Food images for the floating gallery
  const foodImages = [
    { src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop", alt: "Artisan pizza" },
    { src: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop", alt: "Gourmet burger" },
    { src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop", alt: "Fresh salad bowl" },
    { src: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop", alt: "Elegant pasta" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background with food imagery overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
            alt="Fine dining restaurant interior"
            className="h-full w-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/95 to-white" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pt-20 pb-4 lg:pt-24 lg:pb-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage all your <span className="text-orange-600">delivery channels</span> on one dashboard
            </h1>
            
            <p className="mt-6 text-lg text-slate-600">
              Stop juggling multiple tablets. Integrate Uber Eats, DoorDash, Grubhub and more directly into your POS. Update menus everywhere with one click.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/contact?demo=delivery"
                className="group flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-orange-200/60 transition hover:bg-orange-700 hover:shadow-orange-300/70"
              >
                Get a Free Demo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/integrations"
                className="group flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
              >
                See Integrations
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600 lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup in <strong className="text-slate-900">7 days</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Uptime: <strong className="text-slate-900">99.99%</strong></span>
              </div>
            </div>
          </div>

          {/* Right Visual - Dashboard Mockup with Food */}
          <div className="relative hidden lg:block">
            {/* Floating Food Images */}
            <div className="absolute -left-8 top-8 z-20">
              <div className="relative">
                <img
                  src={foodImages[0].src}
                  alt={foodImages[0].alt}
                  className="h-24 w-24 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
                />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-orange-500 p-1.5 shadow-lg">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 top-4 z-20">
              <img
                src={foodImages[1].src}
                alt={foodImages[1].alt}
                className="h-20 w-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
              />
            </div>
            
            <div className="absolute -left-4 bottom-24 z-20">
              <img
                src={foodImages[2].src}
                alt={foodImages[2].alt}
                className="h-16 w-16 rounded-xl object-cover shadow-xl ring-4 ring-white"
              />
            </div>

            {/* Main Dashboard Mockup */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
              <div className="rounded-2xl bg-slate-50 p-4">
                {/* Mock Browser Header */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-slate-400">
                    app.restauranthubsolution.com/dashboard
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="space-y-3">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[10px] text-slate-500">Today's Orders</p>
                      <p className="text-xl font-bold text-slate-900">247</p>
                      <p className="text-[10px] text-orange-600">↑ 12%</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[10px] text-slate-500">Revenue</p>
                      <p className="text-xl font-bold text-slate-900">$8.4k</p>
                      <p className="text-[10px] text-orange-600">↑ 8%</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-[10px] text-slate-500">Avg Prep</p>
                      <p className="text-xl font-bold text-slate-900">14m</p>
                      <p className="text-[10px] text-orange-600">↓ 2m</p>
                    </div>
                  </div>
                  
                  {/* Orders List */}
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">Live Orders</p>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">12 active</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { platform: "Uber Eats", name: "John D.", items: "2x Burger, 1x Fries", status: "Preparing", color: "bg-yellow-100 text-yellow-700" },
                        { platform: "DoorDash", name: "Sarah M.", items: "1x Pizza, 2x Wings", status: "Ready", color: "bg-orange-100 text-orange-700" },
                        { platform: "Deliveroo", name: "Mike R.", items: "3x Tacos, 1x Drink", status: "New", color: "bg-blue-100 text-blue-700" },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                            <img
                              src={getLogoUrl(platformDomains[order.platform])}
                              alt={order.platform}
                              className="h-4 w-4 object-contain"
                            />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-slate-900 truncate">{order.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{order.items}</p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${order.color}`}>{order.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Order Toast - Professional Animation */}
            <div className="absolute -right-4 bottom-16 z-30 w-56">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNotification}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5"
                >
                  {/* Toast Header */}
                  <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                      <img
                        src={getLogoUrl(platformDomains[notifications[activeNotification].platform])}
                        alt={notifications[activeNotification].platform}
                        className="h-3.5 w-3.5 object-contain"
                      />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">
                      {notifications[activeNotification].platform}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                      </span>
                      <span className="text-[9px] text-orange-500 font-medium">Live</span>
                    </span>
                  </div>
                  {/* Toast Body */}
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] font-medium text-slate-900">New order received</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{notifications[activeNotification].order}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-500">{notifications[activeNotification].amount}</span>
                      <span className="text-[9px] text-slate-400">Just now</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Partners Showcase */}
      <div className="mx-auto max-w-6xl px-6 pb-0">
        <DeliveryPartners variant="hero" showLabel />
      </div>
    </section>
  );
}
