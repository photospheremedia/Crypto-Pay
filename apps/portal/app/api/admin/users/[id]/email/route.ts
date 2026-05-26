import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { routeError, routeUnauthorized } from "@/lib/api/route-error";
import { checkAdminAccess } from "@/lib/admin-auth";
import { assertMerchantAccount } from "@/lib/admin/merchant-directory";
import { routeForbidden } from "@/lib/api/route-error";
import { notifyMerchantAdminMessage } from "@/lib/admin/notify-merchant-message";
import { MERCHANT_SUPPORT_REPLY } from "@/lib/email/routing";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

type Params = { params: Promise<{ id: string }> };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const { id: merchantUserId } = await params;
    if (!isUuid(merchantUserId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await parseRequestJson<{
      subject?: string;
      message?: string;
      walletId?: string;
    }>(req);
    if (body instanceof Response) return body;

    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    const walletId = body.walletId?.trim();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 },
      );
    }

    const service = getSupabaseServiceClient();

    const { data: profilePeek } = await service
      .from("user_profiles")
      .select("email")
      .eq("id", merchantUserId)
      .maybeSingle();

    const merchantCheck = await assertMerchantAccount(
      service,
      merchantUserId,
      profilePeek?.email,
    );
    if (!merchantCheck.ok) {
      return routeForbidden(merchantCheck.error);
    }

    const { data: authUser, error: authError } =
      await service.auth.admin.getUserById(merchantUserId);

    if (authError || !authUser?.user?.email) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const merchantEmail = authUser.user.email;
    const merchantName =
      (authUser.user.user_metadata?.full_name as string | undefined) ??
      (authUser.user.user_metadata?.given_name as string | undefined) ??
      null;

    const result = await notifyMerchantAdminMessage({
      merchantEmail,
      merchantName,
      subject,
      message,
      adminEmail: user.email ?? MERCHANT_SUPPORT_REPLY,
      adminName:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.given_name as string | undefined) ??
        null,
      walletId,
      merchantUserId,
      adminUserId: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to send email" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    return routeError(error, { logContext: "admin/users/[id]/email POST" });
  }
}
