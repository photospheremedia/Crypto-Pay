import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import {
  routeBadRequest,
  routeError,
  routeForbidden,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { checkAdminAccess } from "@/lib/admin-auth";
import { loadMerchantAdminContext } from "@/lib/admin/merchant-admin-context";
import {
  executeMerchantAdminAction,
  isMerchantAdminAction,
  MERCHANT_ADMIN_ACTIONS,
  type MerchantActionBody,
} from "@/lib/admin/execute-merchant-admin-action";
import { isUuid } from "@/lib/admin/is-uuid";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const access = await checkAdminAccess();
    if (!access.user || !access.isAdmin || !access.permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const { id: merchantUserId } = await params;
    if (!isUuid(merchantUserId)) {
      return routeBadRequest("Invalid user id");
    }

    const body = await parseRequestJson<MerchantActionBody>(req);
    if (body instanceof Response) return body;

    if (!body.action || !isMerchantAdminAction(body.action)) {
      return routeBadRequest(
        `Unknown action. Use one of: ${MERCHANT_ADMIN_ACTIONS.join(", ")}`,
      );
    }

    if (
      body.action === "delete_account" &&
      !access.permissions.canManageStaff
    ) {
      return routeForbidden(
        "Deleting merchant accounts requires staff management permission.",
      );
    }

    const ctx = await loadMerchantAdminContext(merchantUserId);
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const result = await executeMerchantAdminAction(
      ctx,
      {
        id: access.user.id,
        email: access.user.email,
        name:
          (access.user.user_metadata?.full_name as string | undefined) ??
          (access.user.user_metadata?.given_name as string | undefined) ??
          null,
      },
      body,
    );

    if (!result.success) {
      const status =
        result.error?.includes("recently") ||
        result.error?.includes("Only pending")
          ? 400
          : 502;
      return NextResponse.json({ error: result.error ?? "Action failed" }, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return routeError(error, { logContext: "admin/users/[id]/actions POST" });
  }
}
