import { NextRequest, NextResponse } from "next/server";
import { parseWalletIdParam } from "@/lib/api/parse-wallet-id";
import { routeInternalError, routeUnauthorized } from "@/lib/api/route-error";
import { revalidateMerchantWallets } from "@/lib/account/merchant-data";
import { createClient } from "@/lib/supabase/server";
import { resendMerchantWalletVerification } from "@/lib/wallets/merchant-wallet-service";
import { walletServiceErrorResponse } from "@/lib/wallets/merchant-wallet-public";

export const runtime = "nodejs";

export async function POST(
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

    const result = await resendMerchantWalletVerification(supabase, user, id);
    if (!result.ok) {
      const { body, status } = walletServiceErrorResponse(result.code);
      return NextResponse.json(body, { status });
    }

    revalidateMerchantWallets(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeInternalError(error, {
      logContext: "account/wallets/[id]/resend POST",
    });
  }
}
