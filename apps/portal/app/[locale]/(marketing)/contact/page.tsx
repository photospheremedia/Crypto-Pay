"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MarketingPageShell } from "@/components/cryptopay/marketing-section";
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

const CONTACT_EMAILS = {
  sales: "hello@cryptopay.sale",
  integration: "hello@cryptopay.sale",
  support: "support@cryptopay.sale",
} as const;

const LOCATION_KEYS = ["1", "2-5", "6-10", "11-25", "25+"] as const;
const INTEREST_KEYS = [
  "paymentLinks",
  "apiIntegration",
  "walletVerification",
  "customCheckout",
  "volumePricing",
] as const;

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const tAuth = useTranslations("Auth.layout");
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

  const contactPoints = [
    { key: "sales" as const, icon: Mail, email: CONTACT_EMAILS.sales },
    { key: "integration" as const, icon: MessageSquare, email: CONTACT_EMAILS.integration },
    { key: "support" as const, icon: Phone, email: CONTACT_EMAILS.support },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("errors.nameRequired");
    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("errors.emailInvalid");
    }
    if (!formData.company.trim()) newErrors.company = t("errors.companyRequired");
    if (!formData.message.trim()) newErrors.message = t("errors.messageRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const subject = encodeURIComponent(
      t("form.emailSubject", { company: formData.company }),
    );
    const interestLabels = formData.interest.map((key) =>
      t(`interests.${key as (typeof INTEREST_KEYS)[number]}`),
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || t("form.notProvided")}\nCompany: ${formData.company}\nLocations: ${formData.locations ? t(`locationCounts.${formData.locations as (typeof LOCATION_KEYS)[number]}`) : t("form.notSpecified")}\nInterested in: ${interestLabels.join(", ") || t("form.notSpecified")}\n\nMessage:\n${formData.message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAILS.sales}?subject=${subject}&body=${body}`;

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleInterestToggle = (interestKey: string) => {
    setFormData((prev) => ({
      ...prev,
      interest: prev.interest.includes(interestKey)
        ? prev.interest.filter((i) => i !== interestKey)
        : [...prev.interest, interestKey],
    }));
  };

  if (isSubmitted) {
    return (
      <MarketingPageShell narrow className="text-center">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-green-200 bg-green-50 p-10">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="font-display mt-6 text-3xl font-semibold text-slate-900">
              {t("success.title")}
            </h1>
            <p className="mt-4 text-slate-600">
              {t("success.emailClient")}{" "}
              <a
                href={`mailto:${CONTACT_EMAILS.sales}`}
                className="text-emerald-500 underline"
              >
                {CONTACT_EMAILS.sales}
              </a>
            </p>
            <p className="mt-2 text-sm text-slate-500">{t("success.responseTime")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
              >
                {t("success.sendAnother")}
              </button>
              <Link
                href="/"
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white"
              >
                {tAuth("backToHome")}
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
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{t("hero.description")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 hover:bg-emerald-600"
            >
              {t("hero.startOnboarding")}
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              {t("hero.viewPricing")}
            </Link>
          </div>

          <div className="mt-10 grid gap-4">
            {contactPoints.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="rounded-xl bg-emerald-50 p-2.5">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {t(`channels.${item.key}.title`)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {t(`channels.${item.key}.copy`)}
                    </p>
                    <a
                      href={`mailto:${item.email}`}
                      className="mt-1 inline-block text-sm text-emerald-600 hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-900">{t("info.office")}</p>
                <p className="text-sm text-slate-600">{t("info.officeLocation")}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-900">{t("info.responseTime")}</p>
                <p className="text-sm text-slate-600">{t("info.responseTimeDetail")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-lg lg:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {t("form.eyebrow")}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder={t("form.namePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder={t("form.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <input
              type="tel"
              placeholder={t("form.phonePlaceholder")}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />

            <div>
              <input
                type="text"
                placeholder={t("form.companyPlaceholder")}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.company ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-500">{errors.company}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs text-slate-500">{t("form.locationsLabel")}</p>
              <div className="flex flex-wrap gap-2">
                {LOCATION_KEYS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setFormData({ ...formData, locations: loc })}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      formData.locations === loc
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {t(`locationCounts.${loc}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-slate-500">{t("form.interestsLabel")}</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_KEYS.map((interestKey) => (
                  <button
                    key={interestKey}
                    type="button"
                    onClick={() => handleInterestToggle(interestKey)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      formData.interest.includes(interestKey)
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    {t(`interests.${interestKey}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                placeholder={t("form.messagePlaceholder")}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 ${
                  errors.message ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message}</p>
              )}
            </div>

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
                  {t("form.submit")}
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">{t("form.submitHint")}</p>
          </form>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-slate-200 bg-linear-to-r from-emerald-50 to-white px-8 py-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">
            {t("demo.eyebrow")}
          </p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
            {t("demo.title")}
          </h3>
        </div>
        <a
          href="mailto:hello@cryptopay.sale?subject=Demo%20Request"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 hover:bg-emerald-600"
        >
          {t("demo.bookDemo")}
        </a>
      </div>
    </MarketingPageShell>
  );
}
