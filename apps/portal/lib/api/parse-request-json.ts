import { routeBadRequest } from "@/lib/api/route-error";
import { isJsonSyntaxError } from "@/lib/errors";

/**
 * Parse JSON request bodies without throwing (invalid JSON → 400).
 */
export async function parseRequestJson<T extends Record<string, unknown>>(
  request: Request,
): Promise<T | Response> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return routeBadRequest("Request body must be a JSON object");
    }
    return body as T;
  } catch (error) {
    if (isJsonSyntaxError(error)) {
      return routeBadRequest("Invalid JSON in request body");
    }
    throw error;
  }
}
