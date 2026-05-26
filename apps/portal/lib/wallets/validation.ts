import { z } from "zod";
import type { WalletNetwork } from "./constants";

const networkSchema = z.enum(["btc", "eth", "ltc", "usdt", "usdc"]);

export const merchantWalletSchema = z.object({
  id: z.string().uuid().optional(),
  label: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(64, "Name is too long.")
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, "Use letters, numbers, spaces, or - _ . only."),
  walletNetwork: networkSchema,
  walletAddress: z
    .string()
    .min(12, "Enter a valid wallet address.")
    .max(255, "Address is too long."),
  isPrimary: z.boolean().optional(),
});

export type MerchantWalletInput = z.infer<typeof merchantWalletSchema>;

export function isWalletNetwork(value: string): value is WalletNetwork {
  return networkSchema.safeParse(value).success;
}
