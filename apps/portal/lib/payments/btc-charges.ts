import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CryptoPaymentCharge,
  PaymentChargeStatus,
} from "@/types/crypto-pay-db";
import { mapProviderStatusToChargeStatus } from "@/lib/btc-provider/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", any>;

export const PAYMENT_CHARGE_PUBLIC_SELECT =
  "id, reference, fiat_amount, fiat_currency, crypto, crypto_amount, btc_address, status, provider_status, value_satoshi, txid, price_locked_until, created_at, updated_at";

export function paymentCharges(client: SupabaseClient) {
  return (client as AnyClient).from("crypto_payment_charges");
}

export type PublicPaymentCharge = Pick<
  CryptoPaymentCharge,
  | "id"
  | "reference"
  | "fiat_amount"
  | "fiat_currency"
  | "crypto"
  | "crypto_amount"
  | "btc_address"
  | "status"
  | "provider_status"
  | "value_satoshi"
  | "txid"
  | "price_locked_until"
  | "created_at"
  | "updated_at"
>;

export function toPublicPaymentCharge(row: CryptoPaymentCharge): PublicPaymentCharge {
  return {
    id: row.id,
    reference: row.reference,
    fiat_amount: Number(row.fiat_amount),
    fiat_currency: row.fiat_currency,
    crypto: row.crypto,
    crypto_amount: Number(row.crypto_amount),
    btc_address: row.btc_address,
    status: row.status,
    provider_status: row.provider_status,
    value_satoshi: row.value_satoshi,
    txid: row.txid,
    price_locked_until: row.price_locked_until,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listUserPaymentCharges(
  client: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<PublicPaymentCharge[]> {
  const { data, error } = await paymentCharges(client)
    .select(PAYMENT_CHARGE_PUBLIC_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => toPublicPaymentCharge(row as CryptoPaymentCharge));
}

export async function getUserPaymentCharge(
  client: SupabaseClient,
  userId: string,
  chargeId: string,
): Promise<PublicPaymentCharge | null> {
  const { data, error } = await paymentCharges(client)
    .select(PAYMENT_CHARGE_PUBLIC_SELECT)
    .eq("user_id", userId)
    .eq("id", chargeId)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicPaymentCharge(data as CryptoPaymentCharge) : null;
}

export async function insertPaymentCharge(
  client: SupabaseClient,
  row: {
    user_id: string;
    reference?: string | null;
    fiat_amount: number;
    fiat_currency: string;
    crypto: string;
    crypto_amount: number;
    btc_address: string;
    provider_account?: string | null;
    price_locked_until: string;
  },
): Promise<PublicPaymentCharge> {
  const { data, error } = await paymentCharges(client)
    .insert(row)
    .select(PAYMENT_CHARGE_PUBLIC_SELECT)
    .single();

  if (error) throw error;
  return toPublicPaymentCharge(data as CryptoPaymentCharge);
}

export async function applyProviderCallbackToCharge(params: {
  client: SupabaseClient;
  addr: string;
  providerStatus: number;
  txid: string;
  valueSatoshi: number;
  rbf?: number | null;
}): Promise<{ updated: boolean; charge: PublicPaymentCharge | null }> {
  const status: PaymentChargeStatus = mapProviderStatusToChargeStatus(
    params.providerStatus,
  );

  const { data: existing, error: findError } = await paymentCharges(params.client)
    .select("id, user_id, status, provider_status")
    .eq("btc_address", params.addr)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (!existing) return { updated: false, charge: null };

  const { data, error } = await paymentCharges(params.client)
    .update({
      status,
      provider_status: params.providerStatus,
      value_satoshi: params.valueSatoshi,
      txid: params.txid,
      rbf: params.rbf ?? null,
    })
    .eq("id", existing.id)
    .select(PAYMENT_CHARGE_PUBLIC_SELECT)
    .single();

  if (error) throw error;
  return { updated: true, charge: toPublicPaymentCharge(data as CryptoPaymentCharge) };
}
