"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HelpCircle, BookOpen, MessageCircle, FileText, Mail, ExternalLink } from "lucide-react";

export function AdminHelpMenu() {
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
      title: "Documentation",
      description: "Browse admin guides",
      href: "/admin/help",
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get help from our team",
      href: "/admin/support",
    },
    {
      icon: FileText,
      title: "What's New",
      description: "Latest updates & features",
      href: "/admin/changelog",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "support@cryptopay.sale",
      href: "mailto:support@cryptopay.sale",
      external: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Help and support"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 fade-in-0 z-50">
          {/* Header */}
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Help & Support
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Get assistance and learn more
            </p>
          </div>

          {/* Help Links */}
          <div className="py-2">
            {helpLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shrink-0 group-hover:bg-emerald-200 transition-colors">
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {link.title}
                    </p>
                    {link.external && (
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
            <p className="text-xs text-slate-600">
              Need urgent help?{" "}
              <a
                href="tel:+1234567890"
                className="font-medium text-emerald-500 hover:text-emerald-600"
              >
                Call us
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
