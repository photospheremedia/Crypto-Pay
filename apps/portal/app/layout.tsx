import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieConsent } from "@/components/cookie-consent";
import { ToastProvider } from "@/hooks/use-toast";
import { isRtlLocale } from "@/i18n/routing";
import { getHtmlLang } from "@/lib/i18n/locale-config";
import { BRAND } from "@/lib/cryptopay/constants";
import {
  SITE_METADATA,
  SITE_URL,
  buildLanguageAlternates,
  buildOpenGraphLocale,
  sharedOpenGraph,
} from "@/lib/site-metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_METADATA.applicationName,
  title: {
    default: SITE_METADATA.title,
    template: `%s | ${BRAND.name}`,
  },
  description: SITE_METADATA.description,
  keywords: [
    "crypto payments",
    "bitcoin payments",
    "merchant crypto",
    "direct wallet payments",
    "crypto checkout",
    "payment API",
    "wallet payments",
  ],
  authors: [{ name: BRAND.name, url: SITE_URL }],
  creator: BRAND.name,
  publisher: BRAND.name,
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  openGraph: {
    ...sharedOpenGraph,
    type: "website",
    url: SITE_URL,
    title: SITE_METADATA.title,
    description: SITE_METADATA.ogDescription,
    ...buildOpenGraphLocale("en"),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_METADATA.title,
    description: SITE_METADATA.twitterDescription,
    creator: SITE_METADATA.twitterCreator,
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
    canonical: SITE_URL,
    languages: buildLanguageAlternates("/"),
  },
  category: "technology",
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE_METADATA.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={getHtmlLang(locale)}
      dir={dir}
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-dvh bg-gray-50">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
