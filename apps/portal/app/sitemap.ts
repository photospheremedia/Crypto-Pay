import { MetadataRoute } from "next";
import {
  buildLanguageAlternates,
  localePath,
} from "@/lib/i18n/locale-config";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale";

const MARKETING_PATHS = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/developers", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/get-started", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms-of-service", changeFrequency: "yearly" as const, priority: 0.3 },
];

function absoluteUrl(path: string) {
  const relative = localePath(routing.defaultLocale, path);
  return relative === "/" ? BASE_URL : `${BASE_URL}${relative}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return MARKETING_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(buildLanguageAlternates(path)).map(([hreflang, relativePath]) => [
          hreflang,
          relativePath === "/"
            ? BASE_URL
            : `${BASE_URL}${relativePath}`,
        ]),
      ),
    },
  }));
}
