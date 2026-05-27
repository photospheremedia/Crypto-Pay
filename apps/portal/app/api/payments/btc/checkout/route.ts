import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import {
  routeBadRequest,
  routeInternalError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { btcProviderNewAddress, btcProviderPrice } from "@/lib/btc-provider/client";
import { insertPaymentCharge } from "@/lib/payments/btc-charges";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PRICE_LOCK_MINUTES = 15;

const checkoutSchema = z.object({
  fiat_amount: z.number().positive(),
  fiat_currency: z.string().min(3).max(8).default("USD"),
  reference: z.string().max(120).optional(),
  reset: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BTC_PROVIDER_API_KEY?.trim();
    if (!apiKey) {
      return routeBadRequest("BTC provider is not configured");
    }

    const body = await parseRequestJson<Record<string, unknown>>(req);
    if (body instanceof Response) return body;

    const parsed = checkoutSchema.safeParse({
      fiat_amount: body.fiat_amount ?? body.fiatAmount,
      fiat_currency: body.fiat_currency ?? body.fiatCurrency ?? "USD",
      reference: body.reference,
      reset: body.reset,
    });

    if (!parsed.success) {
      return routeBadRequest("Invalid checkout payload");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return routeUnauthorized();

    const currency = parsed.data.fiat_currency.toUpperCase();
    const { price } = await btcProviderPrice({ apiKey, currency, crypto: "BTC" });
    const cryptoAmount = Number((parsed.data.fiat_amount / price).toFixed(8));

    const addressData = await btcProviderNewAddress({
      apiKey,
      reset: parsed.data.reset,
      crypto: "BTC",
    });

    const priceLockedUntil = new Date(
      Date.now() + PRICE_LOCK_MINUTES * 60 * 1000,
    ).toISOString();

    const charge = await insertPaymentCharge(supabase, {
      user_id: user.id,
      reference: parsed.data.reference ?? null,
      fiat_amount: parsed.data.fiat_amount,
      fiat_currency: currency,
      crypto: "BTC",
      crypto_amount: cryptoAmount,
      btc_address: addressData.address,
      provider_account: addressData.account ?? null,
      price_locked_until: priceLockedUntil,
    });

    return NextResponse.json({
      success: true,
      charge,
      checkout: {
        address: addressData.address,
        crypto_amount: cryptoAmount,
        fiat_amount: parsed.data.fiat_amount,
        fiat_currency: currency,
        btc_price: price,
        price_locked_until: priceLockedUntil,
        bitcoin_uri: `bitcoin:${addressData.address}?amount=${cryptoAmount}`,
      },
    });
  } catch (error) {
    return routeInternalError(error, { logContext: "payments/btc/checkout POST" });
  }
}
