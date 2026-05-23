import Link from "next/link";
import { BRAND } from "@/lib/cryptopay/constants";
import { CryptoPayLogo } from "./crypto-pay-logo";

const footerLinks = {
  Product: [
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Developers", href: "/developers" },
  ],
  Company: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

export function CryptoPayFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <CryptoPayLogo />
            <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
              {BRAND.tagline}
            </p>
            <p className="text-sm text-slate-600">{BRAND.email}</p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
