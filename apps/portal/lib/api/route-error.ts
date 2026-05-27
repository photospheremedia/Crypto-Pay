import { NextResponse } from "next/server";
import { getErrorMessage, reportError } from "@/lib/errors";

export type RouteErrorBody = {
  error: string;
  code?: string;
};

/**
 * Standard JSON error response for App Router route handlers.
 */
export function routeError(
  error: unknown,
  options?: {
    status?: number;
    fallback?: string;
    code?: string;
    logContext?: string;
  },
): NextResponse<RouteErrorBody> {
  const status = options?.status ?? 500;
  const message = getErrorMessage(error, options?.fallback ?? "Internal server error");

  reportError(error, {
    source: "api",
    context: options?.logContext ?? "route",
    status,
  });

  const body: RouteErrorBody = { error: message };
  if (options?.code) body.code = options.code;

  return NextResponse.json(body, { status });
}

export function routeUnauthorized(message = "Unauthorized"): NextResponse<RouteErrorBody> {
  return NextResponse.json({ error: message, code: "unauthorized" }, { status: 401 });
}

export function routeBadRequest(message: string): NextResponse<RouteErrorBody> {
  return NextResponse.json({ error: message, code: "bad_request" }, { status: 400 });
}

export function routeForbidden(message: string): NextResponse<RouteErrorBody> {
  return NextResponse.json({ error: message, code: "forbidden" }, { status: 403 });
}

/** 500 with a generic message in production (no Supabase/Postgres details to clients). */
export function routeInternalError(
  error: unknown,
  options?: {
    fallback?: string;
    logContext?: string;
  },
): NextResponse<RouteErrorBody> {
  reportError(error, {
    source: "api",
    context: options?.logContext ?? "route",
    status: 500,
  });

  const fallback =
    options?.fallback ?? "Something went wrong. Please try again.";
  const message =
    process.env.NODE_ENV === "development"
      ? getErrorMessage(error, fallback)
      : fallback;

  return NextResponse.json(
    { error: message, code: "internal_error" },
    { status: 500 },
  );
}
