import { parseJsonApiResponse } from "@/lib/api/parse-json-api-response";
import type { PublicPaymentCharge } from "@/lib/payments/btc-charges";

export type BtcCheckoutResponse = {
  success: true;
  charge: PublicPaymentCharge;
  checkout: {
    address: string;
    crypto_amount: number;
    fiat_amount: number;
    fiat_currency: string;
    btc_price: number;
    price_locked_until: string;
    bitcoin_uri: string;
  };
};

export async function createBtcCheckout(payload: {
  fiatAmount: number;
  fiatCurrency?: string;
  reference?: string;
}): Promise<BtcCheckoutResponse> {
  const res = await fetch("/api/payments/btc/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fiat_amount: payload.fiatAmount,
      fiat_currency: payload.fiatCurrency ?? "USD",
      reference: payload.reference,
    }),
  });

  const parsed = await parseJsonApiResponse<BtcCheckoutResponse>(res, "Checkout failed");
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.data;
}

export async function listBtcCharges(): Promise<PublicPaymentCharge[]> {
  const res = await fetch("/api/payments/btc/charges");
  const parsed = await parseJsonApiResponse<{ success: true; charges: PublicPaymentCharge[] }>(
    res,
    "Failed to load charges",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.data.charges ?? [];
}

export async function getBtcCharge(id: string): Promise<PublicPaymentCharge> {
  const res = await fetch(`/api/payments/btc/charges/${encodeURIComponent(id)}`);
  const parsed = await parseJsonApiResponse<{ success: true; charge: PublicPaymentCharge }>(
    res,
    "Failed to load charge",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.data.charge;
}
