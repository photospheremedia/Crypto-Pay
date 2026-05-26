import { locales } from "@/i18n/routing";

/** Path without locale prefix (e.g. `/en/admin/wallets` → `/admin/wallets`). */
export function pathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    (locales as readonly string[]).includes(segments[0] as (typeof locales)[number])
  ) {
    const rest = segments.slice(1);
    return rest.length > 0 ? `/${rest.join("/")}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function formatSegment(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

/** Breadcrumbs for `/admin/*` with a root link to the operations dashboard. */
export function buildAdminBreadcrumbs(
  pathname: string,
  operationsOverviewLabel: string,
): AdminBreadcrumbItem[] {
  const path = pathnameWithoutLocale(pathname);
  if (!path.startsWith("/admin")) {
    return [];
  }

  const rest = path.split("/").filter(Boolean).slice(1);

  if (rest.length === 0 || (rest.length === 1 && rest[0] === "dashboard")) {
    return [{ label: operationsOverviewLabel }];
  }

  const crumbs: AdminBreadcrumbItem[] = [
    { label: operationsOverviewLabel, href: "/admin/dashboard" },
  ];

  let currentPath = "/admin";
  for (let i = 0; i < rest.length; i++) {
    const segment = rest[i];
    if (segment === "dashboard") {
      continue;
    }
    currentPath += `/${segment}`;
    const label = formatSegment(segment);
    const isLast = i === rest.length - 1;
    crumbs.push(isLast ? { label } : { label, href: currentPath });
  }

  return crumbs;
}
