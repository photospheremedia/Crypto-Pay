import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Crypto Pay",
    title: "Crypto Pay — Accept Crypto Payments Instantly",
    description:
      "Accept crypto payments instantly with direct wallet checkout, settlement tracking, and merchant-ready APIs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Crypto Pay — Accept Crypto Payments Instantly",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Pay — Accept Crypto Payments Instantly",
    description:
      "Merchant crypto checkout for fast, secure wallet-to-wallet payments.",
    images: ["/og-image.png"],
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
