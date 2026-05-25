import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getLocale } from "next-intl/server";
import { CookieConsent } from "@/components/cookie-consent";
import { ToastProvider } from "@/hooks/use-toast";
import { isRtlLocale } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Crypto Pay — Accept Crypto Payments Instantly",
    template: "%s | Crypto Pay",
  },
  description:
    "Accept crypto payments instantly, securely, and globally. Direct wallet settlement for modern merchants.",
  keywords: [
    "crypto payments",
    "bitcoin payments",
    "merchant crypto",
    "direct wallet payments",
    "crypto checkout",
    "payment API",
    "wallet payments",
  ],
  authors: [{ name: "Crypto Pay", url: siteUrl }],
  creator: "Crypto Pay",
  publisher: "Crypto Pay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Crypto Pay",
    title: "Crypto Pay — Accept Crypto Payments Instantly",
    description:
      "Accept crypto payments instantly with direct wallet checkout, settlement tracking, and merchant-ready APIs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Pay — Accept Crypto Payments Instantly",
    description:
      "Merchant crypto checkout for fast, secure wallet-to-wallet payments.",
    creator: "@resthubsolution",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-dvh bg-gray-50">
        <ToastProvider>{children}</ToastProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
