"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumb / Back button */}
      {(backHref || backLabel) && (
        <button
          onClick={handleBack}
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{backLabel || "Back"}</span>
        </button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && (
              <Badge
                variant={badge.variant || "secondary"}
                className={badge.className}
              >
                {badge.label}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

// Stat card component for dashboard pages
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: "slate" | "blue" | "orange" | "purple" | "amber" | "green" | "red";
  href?: string;
  highlight?: boolean;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const colorClasses = {
  slate: "bg-slate-50 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-emerald-50 text-emerald-500",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "slate",
  href,
  highlight,
  trend,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-4 transition-all",
        href && "hover:border-emerald-300 hover:shadow-sm cursor-pointer",
        highlight && "ring-2 ring-emerald-500 ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            colorClasses[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {highlight && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-red-600"
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

// Empty state component
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingIndicator size="lg" />
    </div>
  );
}
