import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/lib/cryptopay/constants";
import { CryptoPayLogo } from "./crypto-pay-logo";

const footerSections = [
  {
    section: "product" as const,
    links: [
      { labelKey: "pricing" as const, labelNs: "Navigation" as const, href: "/pricing" },
      { labelKey: "howItWorks" as const, labelNs: "Navigation" as const, href: "/how-it-works" },
      { labelKey: "developers" as const, labelNs: "Navigation" as const, href: "/developers" },
    ],
  },
  {
    section: "company" as const,
    links: [
      { labelKey: "contact" as const, labelNs: "Footer" as const, href: "/contact" },
      { labelKey: "faq" as const, labelNs: "Footer" as const, href: "/faq" },
    ],
  },
  {
    section: "legal" as const,
    links: [
      { labelKey: "privacyPolicy" as const, labelNs: "Footer" as const, href: "/privacy-policy" },
      { labelKey: "termsOfService" as const, labelNs: "Footer" as const, href: "/terms-of-service" },
    ],
  },
];

export async function CryptoPayFooter() {
  const tFooter = await getTranslations("Footer");
  const tNav = await getTranslations("Navigation");
  const tCommon = await getTranslations("Common");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <CryptoPayLogo />
            <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
              {tCommon("tagline")}
            </p>
            <p className="text-sm text-slate-600">{BRAND.email}</p>
          </div>
          {footerSections.map(({ section, links }) => (
            <div key={section}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {tFooter(section)}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-600">
                      {link.labelNs === "Navigation"
                        ? tNav(link.labelKey)
                        : tFooter(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} {tCommon("brandName")}. {tCommon("allRightsReserved")}
        </p>
      </div>
    </footer>
  );
}
