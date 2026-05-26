"use client";

import Link from "next/link";
import { MarketingPageShell } from "@/components/cryptopay/marketing-section";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Send,
  Loader2,
  Calendar,
  MessageSquare,
} from "lucide-react";

const contactPoints = [
  {
    title: "Sales + onboarding",
    copy: "New business groups, demos, and pricing.",
    detail: "hello@cryptopay.sale",
    icon: Mail,
  },
  {
    title: "Supply quotes",
    copy: "Packaging, utensils, labels, and bundles.",
    detail: "supplies@cryptopay.sale",
    icon: MessageSquare,
  },
  {
    title: "Support",
    copy: "Live locations and operational assistance.",
    detail: "support@cryptopay.sale",
    icon: Phone,
  },
];

const locationCount = [
  { value: "1", label: "1 location" },
  { value: "2-5", label: "2-5 locations" },
  { value: "6-10", label: "6-10 locations" },
  { value: "11-25", label: "11-25 locations" },
  { value: "25+", label: "25+ locations" },
];

const interests = [
  "Delivery integration",
  "Supply ordering",
  "Menu refresh",
  "Brand update",
  "Full service package",
];

export default function ContactPage() {
  const tCommon = useTranslations("Common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    locations: "",
    interest: [] as string[],
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.company.trim()) newErrors.company = "Company name is required";
    if (!formData.message.trim()) newErrors.message = "Please tell us about your needs";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call - in production, replace with actual API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For now, open email client with form data
    const subject = encodeURIComponent(
      `Contact Request from ${formData.company}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nCompany: ${formData.company}\nLocations: ${formData.locations || "Not specified"}\nInterested in: ${formData.interest.join(", ") || "Not specified"}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:hello@cryptopay.sale?subject=${subject}&body=${body}`;

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interest: prev.interest.includes(interest)
        ? prev.interest.filter((i) => i !== interest)
        : [...prev.interest, interest],
    }));
  };

  if (isSubmitted) {
    return (
      <MarketingPageShell narrow className="text-center">
        <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-10">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="font-display mt-6 text-3xl font-semibold text-slate-900">
            Thanks for reaching out!
          </h1>
          <p className="mt-4 text-slate-600">
            Your email client should have opened with your message. If not, you
            can email us directly at{" "}
            <a
              href="mailto:hello@cryptopay.sale"
              className="text-emerald-500 underline"
            >
              hello@cryptopay.sale
            </a>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            We typically respond within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setIsSubmitted(false)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Send another message
            </button>
            <Link
              href="/"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
        </div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column - Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
            Contact
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">
            Let&apos;s build your rollout plan.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Tell us about your locations, delivery stack, and supply needs. We
            will respond with a tailored onboarding plan and quote.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 hover:bg-emerald-600"
            >
              Start onboarding
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              View pricing
            </Link>
          </div>

          <div className="mt-10 grid gap-4">
            {contactPoints.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="rounded-xl bg-emerald-50 p-2.5">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{item.copy}</p>
                    <a
                      href={`mailto:${item.detail}`}
                      className="mt-1 inline-block text-sm text-emerald-600 hover:underline"
                    >
                      {item.detail}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Office info */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-900">Office</p>
                <p className="text-sm text-slate-600">
                  Los Angeles, CA (remote-first team)
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-900">Response time</p>
                <p className="text-sm text-slate-600">
                  Within 24 hours on business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-lg lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Send a request
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Your name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email address *"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />

            {/* Company */}
            <div>
              <input
                type="text"
                placeholder="Business group / company name *"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.company ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-500">{errors.company}</p>
              )}
            </div>

            {/* Location count */}
            <div>
              <p className="mb-2 text-xs text-slate-500">Number of locations</p>
              <div className="flex flex-wrap gap-2">
                {locationCount.map((loc) => (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, locations: loc.value })
                    }
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      formData.locations === loc.value
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <p className="mb-2 text-xs text-slate-500">
                What are you interested in?
              </p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      formData.interest.includes(interest)
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <textarea
                placeholder="Tell us about your locations and needs *"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.message ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tCommon("sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send request
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              We&apos;ll respond within 24 hours with a custom plan.
            </p>
          </form>
        </div>
      </div>

      {/* Image gallery */}
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          "/images/hero-dashboard.svg",
          "/images/branding-refresh.svg",
          "/images/supply-grid.svg",
        ].map((src, index) => (
          <div
            key={src}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <img
              src={src}
              alt={`Preview ${index + 1}`}
              className="aspect-4/3 w-full object-cover md:aspect-16/10"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Demo CTA */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-slate-200 bg-linear-to-r from-emerald-50 to-white px-8 py-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            Prefer a walkthrough?
          </p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
            Schedule a 20-minute portal demo with our team.
          </h3>
        </div>
        <Link
          href="mailto:hello@cryptopay.sale?subject=Demo%20Request"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 hover:bg-emerald-600"
        >
          Book a demo
        </Link>
      </div>
    </MarketingPageShell>
  );
}
