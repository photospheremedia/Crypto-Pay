import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { parseWalletIdParam } from "@/lib/api/parse-wallet-id";
import {
  routeBadRequest,
  routeInternalError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { revalidateMerchantWallets } from "@/lib/account/merchant-data";
import { createClient } from "@/lib/supabase/server";
import { merchantWallets } from "@/lib/wallets/db";
import { upsertMerchantWallet } from "@/lib/wallets/merchant-wallet-service";
import {
  toPublicMerchantWallet,
  walletServiceErrorResponse,
} from "@/lib/wallets/merchant-wallet-public";
import { merchantWalletSchema } from "@/lib/wallets/validation";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseWalletIdParam(rawId);
    if (id instanceof Response) return id;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return routeUnauthorized();

    const { data, error } = await merchantWallets(supabase)
      .select(
        "id, label, wallet_network, wallet_address, status, is_primary, verification_requested_at, verified_at, rejection_reason, created_at, updated_at",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return routeInternalError(error, { logContext: "account/wallets/[id] GET" });
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Wallet not found", code: "not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      wallet: toPublicMerchantWallet(data),
    });
  } catch (error) {
    return routeInternalError(error, { logContext: "account/wallets/[id] GET" });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseWalletIdParam(rawId);
    if (id instanceof Response) return id;

    const body = await parseRequestJson<Record<string, unknown>>(req);
    if (body instanceof Response) return body;

    const parsed = merchantWalletSchema.safeParse({
      id,
      label: body.label,
      walletNetwork: body.wallet_network ?? body.walletNetwork,
      walletAddress: body.wallet_address ?? body.walletAddress,
      isPrimary: body.is_primary ?? body.isPrimary,
    });

    if (!parsed.success) {
      return routeBadRequest("Invalid wallet details");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return routeUnauthorized();

    const result = await upsertMerchantWallet(supabase, user, parsed.data);
    if (!result.ok) {
      const { body: errBody, status } = walletServiceErrorResponse(result.code);
      return NextResponse.json(errBody, { status });
    }

    revalidateMerchantWallets(user.id);
    return NextResponse.json({
      success: true,
      wallet: toPublicMerchantWallet(result.data!),
    });
  } catch (error) {
    return routeInternalError(error, { logContext: "account/wallets/[id] POST" });
  }
}
