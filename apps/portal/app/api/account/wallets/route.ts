import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import {
  routeBadRequest,
  routeInternalError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { revalidateMerchantWallets } from "@/lib/account/merchant-data";
import { createClient } from "@/lib/supabase/server";
import { listUserMerchantWallets } from "@/lib/wallets/db";
import { upsertMerchantWallet } from "@/lib/wallets/merchant-wallet-service";
import {
  toPublicMerchantWallet,
  toPublicMerchantWallets,
  walletServiceErrorResponse,
} from "@/lib/wallets/merchant-wallet-public";
import { merchantWalletSchema } from "@/lib/wallets/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return routeUnauthorized();

    const wallets = await listUserMerchantWallets(supabase, user.id);
    return NextResponse.json({
      success: true,
      wallets: toPublicMerchantWallets(wallets),
    });
  } catch (error) {
    return routeInternalError(error, { logContext: "account/wallets GET" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestJson<Record<string, unknown>>(req);
    if (body instanceof Response) return body;

    const parsed = merchantWalletSchema
      .omit({ id: true })
      .safeParse({
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
    return routeInternalError(error, { logContext: "account/wallets POST" });
  }
}
