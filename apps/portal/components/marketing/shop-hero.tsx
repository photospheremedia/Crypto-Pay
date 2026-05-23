"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Package, Truck, Clock, BadgePercent, ShoppingCart, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const categories = [
  { name: "Packaging", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&q=80", href: "/shop?category=packaging" },
  { name: "Cutlery", image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&h=400&fit=crop&q=80", href: "/shop?category=cutlery" },
  { name: "Labels", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop&q=80", href: "/shop?category=labels" },
  { name: "Smallwares", image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&h=400&fit=crop&q=80", href: "/shop?category=smallwares" },
];

const benefits = [
  { icon: Truck, label: "Free shipping $500+" },
  { icon: Clock, label: "24hr quotes" },
  { icon: BadgePercent, label: "Bulk discounts" },
  { icon: Package, label: "Auto-restock" },
];

const stats = [
  { value: "5,000+", label: "Products" },
  { value: "24hr", label: "Delivery" },
  { value: "30%", label: "Avg Savings" },
];

export function ShopHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Master timeline for hero entrance - triggered by ScrollTrigger
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top 75%",
        end: "bottom 25%",
        toggleActions: "play none none none",
        once: true,
      },
    });

    // Staggered entrance animations with custom easing
    masterTl
      .from(".shop-hero-title", {
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out",
      })
      .from(
        ".shop-hero-description",
        {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6"
      )
      .from(
        ".shop-hero-cta",
        {
          y: 30,
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          stagger: 0.12,
          ease: "back.out(1.4)",
        },
        "-=0.5"
      )
      .from(
        ".shop-hero-stat",
        {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "elastic.out(1, 0.6)",
        },
        "-=0.4"
      )
      .from(
        ".shop-hero-benefit",
        {
          x: -30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .from(
        ".shop-hero-category",
        {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          stagger: {
            amount: 0.3,
            from: "random",
          },
          ease: "back.out(1.2)",
        },
        "-=0.3"
      );
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="relative w-full min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-orange-900 flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="shop-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#shop-hero-grid)" />
        </svg>
      </div>
      
      {/* Animated gradient orbs with CSS animations */}
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl animate-float-slow" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl animate-float-slower" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2 className="shop-hero-title text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Everything your kitchen needs,{" "}
              <span className="bg-linear-to-r from-orange-400 to-teal-300 bg-clip-text text-transparent">delivered fast</span>
            </h2>
            
            <p className="shop-hero-description mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
              Shop packaging, cutlery, labels, smallwares, and more. Get quoted pricing, bulk discounts, and auto-restock programs tailored for your restaurant.
            </p>

            {/* CTAs - Right after title and description */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/shop"
                className="shop-hero-cta group flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-400 hover:scale-105"
              >
                Browse Shop
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/supplies"
                className="shop-hero-cta flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/50"
              >
                View All Supplies
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="shop-hero-stat text-center lg:text-left">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="shop-hero-benefit flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur transition hover:bg-white/20"
                >
                  <benefit.icon className="h-4 w-4 text-orange-400" />
                  {benefit.label}
                </div>
              ))}
            </div>

          </div>

          {/* Right - Category Grid with better GSAP */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="shop-hero-category group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur transition-all duration-500 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="aspect-square">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-xl font-bold text-white">{cat.name}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-orange-300 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                        Shop now <ArrowRight className="h-4 w-4" />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Trust badge */}
            <div className="mt-6 flex items-center justify-center gap-6 rounded-2xl bg-white/10 backdrop-blur px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle className="h-5 w-5 text-orange-400" />
                <span>Trusted by 500+ restaurants</span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div className="flex items-center gap-2 text-sm text-white">
                <CheckCircle className="h-5 w-5 text-orange-400" />
                <span>Same-day shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
