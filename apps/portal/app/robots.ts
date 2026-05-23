import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/app/",           // Protected dashboard area
          "/admin/",         // Admin area
          "/account/",       // User account area
          "/auth/",          // Auth callbacks
          "/_next/",         // Next.js internals
          "/checkout/",      // Checkout process
          "/cart/",          // Shopping cart
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/app/",
          "/admin/",
          "/account/",
          "/auth/",
          "/checkout/",
          "/cart/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
