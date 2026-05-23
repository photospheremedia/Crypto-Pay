"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Send, Check, Building2, User, Mail, Phone, MessageSquare, Package, Truck, Sparkles } from "lucide-react";

const services = [
  { id: "delivery", name: "Delivery Integration", icon: Truck, description: "Consolidate delivery channels" },
  { id: "supplies", name: "Supply Marketplace", icon: Package, description: "Packaging & equipment sourcing" },
  { id: "branding", name: "Brand Refresh", icon: Sparkles, description: "Menu & website redesign" },
];

export default function QuotePage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-linear-to-b from-orange-50 to-white py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <Check className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            Quote Request Received!
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Thank you for your interest. Our team will review your request and get back to you within 24 hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600 transition"
            >
              Browse Supplies
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-8 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-orange-50 to-white py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-600 mb-6">
            <FileText className="h-4 w-4" />
            Get a Custom Quote
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
            Tell us about your business
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Fill out the form below and our team will prepare a custom quote tailored to your needs. Response within 24 hours guaranteed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              What services are you interested in?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {services.map(service => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition ${
                    selectedServices.includes(service.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    selectedServices.includes(service.id) ? "bg-orange-100" : "bg-slate-100"
                  }`}>
                    <service.icon className={`h-6 w-6 ${
                      selectedServices.includes(service.id) ? "text-orange-500" : "text-slate-500"
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                  </div>
                  {selectedServices.includes(service.id) && (
                    <span className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-orange-500" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Contact Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Building2 className="h-4 w-4" />
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  placeholder="John's Grill"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  placeholder="john@business.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tell us more
            </h2>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <MessageSquare className="h-4 w-4" />
                Additional Details
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition resize-none"
                placeholder="Tell us about your current setup, pain points, or specific needs..."
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Number of Locations
                </label>
                <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition">
                  <option>1 location</option>
                  <option>2-5 locations</option>
                  <option>6-20 locations</option>
                  <option>20+ locations</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Monthly Order Volume
                </label>
                <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition">
                  <option>Under 500 orders</option>
                  <option>500 - 2,000 orders</option>
                  <option>2,000 - 10,000 orders</option>
                  <option>10,000+ orders</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-slate-500">
              * Required fields
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 font-semibold text-white shadow-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Quote Request
                </>
              )}
            </button>
          </div>
        </form>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-orange-500" />
            <span>24h Response Time</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-orange-500" />
            <span>No Obligation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-orange-500" />
            <span>500+ Businesss Served</span>
          </div>
        </div>
      </div>
    </main>
  );
}
