"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  HelpCircle,
  BookOpen,
  Mail,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export function AccountHelpMenu() {
  const t = useTranslations("Account.help");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const helpLinks = [
    {
      icon: BookOpen,
      title: t("documentation"),
      description: t("documentationDescription"),
      href: "/developers",
    },
    {
      icon: Shield,
      title: t("security"),
      description: t("securityDescription"),
      href: "/account/security",
    },
    {
      icon: Mail,
      title: t("emailUs"),
      description: t("emailAddress"),
      href: "mailto:support@cryptopay.sale",
      external: true,
    },
  ] as const;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t("menuLabel")}
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[200] mt-2 w-72 animate-in fade-in-0 slide-in-from-top-2 rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">{t("title")}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{t("subtitle")}</p>
          </div>

          <div className="py-2">
            {helpLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                target={"external" in link && link.external ? "_blank" : undefined}
                rel={
                  "external" in link && link.external ? "noopener noreferrer" : undefined
                }
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-200">
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{link.title}</p>
                    {"external" in link && link.external && (
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
