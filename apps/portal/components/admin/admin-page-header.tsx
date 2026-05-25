"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label = segments[i]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    // Don't make the last item a link
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
  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs(pathname);

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-slate-500 mb-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Dashboard</span>
        </Link>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-slate-300" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-emerald-500 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {backHref && (
            <Link href={backHref}>
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
