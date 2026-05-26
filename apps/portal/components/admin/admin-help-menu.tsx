"use client";

import { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  Wallet,
  Users,
  MessageSquare,
  Mail,
  Settings,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

type HelpLink = {
  icon: typeof Wallet;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const helpLinks: HelpLink[] = [
  {
    icon: Wallet,
    title: "Payout wallet review",
    description: "Approve or reject merchant wallets",
    href: "/admin/wallets",
  },
  {
    icon: Users,
    title: "Merchants",
    description: "Accounts and wallet requests",
    href: "/admin/users",
  },
  {
    icon: MessageSquare,
    title: "Leads & chat",
    description: "Inbound conversations",
    href: "/admin/leads",
  },
  {
    icon: Settings,
    title: "Admin settings",
    description: "Platform configuration",
    href: "/admin/settings",
  },
  {
    icon: Mail,
    title: "Email support",
    description: "support@cryptopay.sale",
    href: "mailto:support@cryptopay.sale",
    external: true,
  },
];

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Help and quick links"
        aria-expanded={isOpen}
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Quick links</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Jump to common admin tasks
            </p>
          </div>

          <div className="py-2">
            {helpLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {link.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {link.description}
                    </p>
                  </div>
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {link.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
