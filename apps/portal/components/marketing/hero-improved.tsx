"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, CheckCircle2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Improved Hero Section - ChowNow inspired
 * 
 * Key improvements:
 * 1. Problem-first headline addressing restaurant pain point
 * 2. Specific ROI metrics ($X savings, X% increase)
 * 3. Trust badges (customer count, awards, support)
 * 4. Clear CTA buttons
 * 5. Social proof: customer testimonials/logos
 */
export function HeroImproved() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-white to-white pt-20 pb-16 sm:pt-32 sm:pb-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        {/* Main Headline - Problem-First Hook */}
        <div className="mb-8 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200 mb-6">
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              Boost your restaurant operations
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Stop losing profits to <span className="text-orange-600">delivery app fees</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Restaurant operators save an average of <span className="font-semibold text-slate-900">$18,000/year</span> using Restaurant Hub's unified platform for delivery consolidation, supply management, and operations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/get-started">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-base font-semibold">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="px-8 h-12 text-base font-semibold">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Badges Row */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900">1,200+</p>
                <p className="text-sm text-slate-600">Active Restaurants</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900">35%</p>
                <p className="text-sm text-slate-600">Avg Sales Increase</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="text-sm text-slate-600">Expert Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Case Study */}
        <div className="mt-16 max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-orange-600">★</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-600 mb-2">FEATURED CASE STUDY</p>
              <p className="text-lg font-bold text-slate-900 mb-2">
                Thai Kitchen LA saved <span className="text-orange-600">$65,000</span> in commission fees
              </p>
              <p className="text-slate-600 mb-4">
                By consolidating 8 delivery platforms and implementing direct ordering, they increased direct orders by 42% within 3 months.
              </p>
              <Link href="#" className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700">
                Read full case study
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
