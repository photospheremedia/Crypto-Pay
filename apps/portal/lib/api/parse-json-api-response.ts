import type { RouteErrorBody } from "@/lib/api/route-error";

export type JsonApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; code?: string };

export async function parseJsonApiResponse<T extends { success?: boolean }>(
  res: Response,
  fallbackError = "Request failed",
): Promise<JsonApiResult<T>> {
  let body: (T & RouteErrorBody) | null = null;
  try {
    body = (await res.json()) as T & RouteErrorBody;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: body?.error ?? fallbackError,
      code: body?.code,
    };
  }

  if (body && "success" in body && body.success === false) {
    return {
      ok: false,
      status: res.status,
      error: body.error ?? fallbackError,
      code: body.code,
    };
  }

  return { ok: true, data: (body ?? {}) as T };
}
