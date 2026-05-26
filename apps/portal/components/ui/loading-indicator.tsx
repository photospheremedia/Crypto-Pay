"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type LoadingMessageKey =
  | "loading"
  | "saving"
  | "updating"
  | "signingOut"
  | "uploading"
  | "deleting"
  | "submitting"
  | "sending"
  | "refreshing"
  | "typing"
  | "processing"
  | "verifying"
  | "sendingResetLink"
  | "resettingPassword"
  | "creatingAccount"
  | "saveChanges"
  | "verifyingResetLink"
  | "redirecting"
  | "thinking"
  | "subscribing"
  | "joining"
  | "loadingLiveRates";

type LoadingIndicatorProps = {
  message?: LoadingMessageKey;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Inline spinner + label (buttons, compact rows) */
  inline?: boolean;
  /** Hide visible label but keep it for screen readers */
  srOnly?: boolean;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

export function LoadingIndicator({
  message = "loading",
  className,
  size = "md",
  inline = false,
  srOnly = false,
}: LoadingIndicatorProps) {
  const t = useTranslations("Common");
  const label = t(message);
  const spinner = (
    <Loader2 className={cn(sizeClasses[size], "animate-spin text-emerald-500", className)} />
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
        {spinner}
        <span className={srOnly ? "sr-only" : undefined}>{label}</span>
      </span>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
    >
      {spinner}
      <p className={cn("text-sm text-muted-foreground", srOnly && "sr-only")}>{label}</p>
    </div>
  );
}

/** Full-page or section loading fallback (Suspense, route transitions) */
export function PageLoading({
  message = "loading",
  className,
  minHeight = "min-h-screen",
}: {
  message?: LoadingMessageKey;
  className?: string;
  minHeight?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center bg-background", minHeight, className)}>
      <LoadingIndicator message={message} size="lg" />
    </div>
  );
}
