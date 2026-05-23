"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Tablet, Store } from "lucide-react";

// Using Logo.dev API for reliable logos
const getLogoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;

// Delivery platforms
const deliveryPlatforms = [
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "DoorDash", domain: "doordash.com" },
  { name: "Grubhub", domain: "grubhub.com" },
  { name: "Deliveroo", domain: "deliveroo.com" },
  { name: "Just Eat", domain: "just-eat.com" },
  { name: "Postmates", domain: "postmates.com" },
  { name: "Talabat", domain: "talabat.com" },
  { name: "Zomato", domain: "zomato.com" },
];

// POS Systems
const posSystems = [
  { name: "Square", domain: "squareup.com" },
  { name: "Toast", domain: "toasttab.com" },
  { name: "Clover", domain: "clover.com" },
  { name: "Lightspeed", domain: "lightspeedhq.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "NCR", domain: "ncr.com" },
];

// Restaurant brands
const trustedRestaurants = [
  { name: "Pizza Hut", domain: "pizzahut.com" },
  { name: "KFC", domain: "kfc.com" },
  { name: "Taco Bell", domain: "tacobell.com" },
  { name: "Domino's", domain: "dominos.com" },
  { name: "Subway", domain: "subway.com" },
  { name: "Chipotle", domain: "chipotle.com" },
  { name: "Wendy's", domain: "wendys.com" },
  { name: "Dunkin'", domain: "dunkindonuts.com" },
  { name: "Papa John's", domain: "papajohns.com" },
  { name: "Popeyes", domain: "popeyes.com" },
];

export function IntegrationsShowcase() {
  return (
    <section className="py-10 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
              Connect Everything.{" "}
              <span className="text-orange-600">Manage Anywhere.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Integrate all your delivery platforms and POS systems into one unified dashboard. 
              Join 45,000+ restaurants worldwide.
            </p>
          </motion.div>
        </div>

        {/* Main Visual Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Delivery Platforms Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <Tablet className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Delivery Platforms</h3>
                  <p className="text-sm text-slate-500">20+ platforms supported</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6">
                All major delivery apps in one place. No more tablet farm. Orders flow directly to your POS.
              </p>
              
              {/* Logo Grid */}
              <div className="grid grid-cols-4 gap-3">
                {deliveryPlatforms.map((platform, index) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:shadow-md transition-all group"
                  >
                    <img
                      src={getLogoUrl(platform.domain)}
                      alt={platform.name}
                      className="h-8 w-8 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="mt-2 text-[10px] font-medium text-slate-600 text-center">{platform.name}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">+ Talabat, Zomato, Swiggy, Glovo...</span>
                <Link href="/integrations" className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:gap-2 transition-all">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* POS Systems Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">POS Integration</h3>
                  <p className="text-sm text-slate-500">150+ systems supported</p>
                </div>
              </div>
              
              <p className="text-slate-600 mb-6">
                Works with your existing POS. No new hardware needed. Orders sync automatically.
              </p>
              
              {/* Logo Grid */}
              <div className="grid grid-cols-3 gap-4">
                {posSystems.map((pos, index) => (
                  <motion.div
                    key={pos.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:shadow-md transition-all group"
                  >
                    <img
                      src={getLogoUrl(pos.domain)}
                      alt={pos.name}
                      className="h-10 w-10 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span className="mt-2 text-xs font-medium text-slate-600">{pos.name}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">+ Revel, TouchBistro, Aloha...</span>
                <Link href="/integrations#pos" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-slate-900 p-8 md:p-12"
        >
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
              Trusted by Industry Leaders
            </p>
            <h3 className="mt-2 text-2xl md:text-3xl font-bold text-white">
              45,000+ Restaurants Worldwide
            </h3>
          </div>
          
          {/* Restaurant Logo Grid - Full Color */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            {trustedRestaurants.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur hover:bg-white/20 transition-all group"
              >
                <img
                  src={getLogoUrl(brand.domain)}
                  alt={brand.name}
                  className="h-12 w-12 md:h-14 md:w-14 object-contain group-hover:scale-110 transition-transform"
                />
                <span className="mt-2 text-xs font-medium text-white/80">{brand.name}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Stats Row */}
          <div className="pt-8 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "45,000+", label: "Restaurants" },
              { value: "250M+", label: "Orders/Year" },
              { value: "99.99%", label: "Uptime" },
              { value: "150+", label: "Integrations" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-orange-400">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/contact?demo=integrations"
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-orange-700 transition-all hover:scale-105"
          >
            Get a Free Demo
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            No credit card required • Setup in 7 days • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
