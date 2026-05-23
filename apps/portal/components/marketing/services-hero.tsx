"use client";

import Link from "next/link";
import { ArrowRight, Palette, Utensils, BarChart3, Headphones } from "lucide-react";

const services = [
  {
    icon: Utensils,
    title: "Menu Redesign",
    description: "Modern menus that drive higher check averages",
    href: "/services/marketing", // Menu design is part of marketing services
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Palette,
    title: "Brand Refresh",
    description: "Updated visuals that attract more customers",
    href: "/services/branding",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Delivery Optimization",
    description: "Consolidate channels, boost efficiency",
    href: "/services/delivery",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Headphones,
    title: "POS & Support",
    description: "Point of sale systems & dedicated support",
    href: "/services/pos",
    color: "from-orange-500 to-teal-500",
  },
];

export function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f6f2ea] to-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center gsap-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Professional Services
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Transform your business&apos;s <span className="text-orange-500">digital presence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            From menu design to delivery optimization, our expert team handles everything so you can focus on cooking.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 gsap-stagger-container">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="gsap-stagger-item group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-900/5 transition hover:shadow-xl hover:-translate-y-1"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${service.color} shadow-lg`}
              >
                <service.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-orange-500 opacity-0 transition group-hover:opacity-100">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
              
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-orange-50/50 to-transparent opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center gsap-fade-up">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-8 py-3 text-base font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
          >
            View All Services
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
