"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AppErrorUiProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  variant?: "segment" | "global";
};

export function AppErrorUi({
  error,
  reset,
  title = "Something went wrong",
  description = "We could not load this page. You can try again or return home.",
  variant = "segment",
}: AppErrorUiProps) {
  const isDev = process.env.NODE_ENV === "development";
  const isCacheCorruption =
    error.message.includes("JSON") || error.name === "SyntaxError";

  function clearDevCache() {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  }

  return (
    <div
      className={
        variant === "global"
          ? "min-h-dvh flex items-center justify-center bg-slate-50 px-4"
          : "flex min-h-[50vh] items-center justify-center px-4 py-16"
      }
    >
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>

        <p className="text-slate-600 mb-4">{description}</p>

        {error.digest ? (
          <p className="mb-6 text-sm text-slate-500">Error ID: {error.digest}</p>
        ) : null}

        {isDev && error.message ? (
          <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-red-200">
            {error.message}
          </pre>
        ) : null}

        {isDev && isCacheCorruption ? (
          <p className="mb-4 text-sm text-amber-700">
            Dev tip: corrupted cache or localStorage JSON. Run{" "}
            <code className="rounded bg-amber-100 px-1">pnpm dev:portal:clean</code> or
            clear site data below.
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button type="button" onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          {isDev && isCacheCorruption ? (
            <Button type="button" variant="secondary" onClick={clearDevCache} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear site data
            </Button>
          ) : null}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          <Link href="/contact" className="text-emerald-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
