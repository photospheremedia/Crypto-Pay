import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "@/components/cookie-consent";
import { ToastProvider } from "@/hooks/use-toast";

const siteUrl = "https://restauranthubsolution.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Restaurant Hub Solution - Streamline Restaurant Operations",
    template: "%s | Restaurant Hub Solution",
  },
  description: "All-in-one restaurant management platform. Consolidate delivery channels, manage supplies, and refresh your brand. Trusted by 150+ locations.",
  keywords: [
    "restaurant management",
    "delivery integration",
    "restaurant supplies",
    "POS integration",
    "ghost kitchen",
    "dark kitchen",
    "franchise management",
    "restaurant operations",
    "menu management",
    "DoorDash integration",
    "UberEats integration",
    "Grubhub integration",
    "restaurant software",
    "order management system",
    "restaurant technology",
    "kitchen management",
    "delivery consolidation",
    "multi-location restaurant",
  ],
  authors: [{ name: "Restaurant Hub Solution", url: siteUrl }],
  creator: "Restaurant Hub Solution",
  publisher: "Restaurant Hub Solution",
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
    siteName: "Restaurant Hub Solution",
    title: "Restaurant Hub Solution - Streamline Your Restaurant Operations",
    description: "Delivery consolidation, supply marketplace, and brand services. Manage 15+ delivery platforms from one tablet. Trusted by 150+ restaurant locations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Restaurant Hub Solution - Operations Made Simple",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Hub Solution - Streamline Your Restaurant Operations",
    description: "All-in-one platform for delivery consolidation, supply management, and brand refresh. Trusted by 150+ restaurants.",
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

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-dvh bg-gray-50">
        <ToastProvider>
          {children}
        </ToastProvider>
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
