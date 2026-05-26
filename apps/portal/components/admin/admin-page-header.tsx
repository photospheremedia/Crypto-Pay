"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildAdminBreadcrumbs,
  pathnameWithoutLocale,
  type AdminBreadcrumbItem,
} from "@/lib/admin/admin-breadcrumbs";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  breadcrumbs?: AdminBreadcrumbItem[];
}

function generateBreadcrumbs(pathname: string): AdminBreadcrumbItem[] {
  const path = pathnameWithoutLocale(pathname);
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs: AdminBreadcrumbItem[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label = segments[i]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (i === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  breadcrumbs: customBreadcrumbs,
}: AdminPageHeaderProps) {
  const pathname = usePathname();
  const tDashboard = useTranslations("Admin.dashboard");
  const operationsOverviewLabel = tDashboard("title");

  const path = pathnameWithoutLocale(pathname);
  const breadcrumbs =
    customBreadcrumbs ??
    (path.startsWith("/admin")
      ? buildAdminBreadcrumbs(pathname, operationsOverviewLabel)
      : generateBreadcrumbs(pathname));

  return (
    <div className="mb-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 transition-colors hover:text-emerald-600"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">{operationsOverviewLabel}</span>
        </Link>
        {breadcrumbs.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-slate-300" />
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-emerald-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {backHref ? (
            <Link href={backHref}>
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
