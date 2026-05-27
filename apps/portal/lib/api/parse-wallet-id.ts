import { z } from "zod";
import { routeBadRequest } from "@/lib/api/route-error";

const walletIdSchema = z.string().uuid();

export function parseWalletIdParam(
  id: string | undefined,
): string | Response {
  const parsed = walletIdSchema.safeParse(id);
  if (!parsed.success) {
    return routeBadRequest("Invalid wallet id");
  }
  return parsed.data;
}
