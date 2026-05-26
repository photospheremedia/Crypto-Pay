import { NextRequest, NextResponse } from "next/server";
import {
  routeBadRequest,
  routeError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { checkAdminAccess } from "@/lib/admin-auth";
import { loadMerchantAdminContext } from "@/lib/admin/merchant-admin-context";
import { toAuthSnapshot } from "@/lib/admin/merchant-supabase-admin";
import { isUuid } from "@/lib/admin/is-uuid";

type Params = { params: Promise<{ id: string }> };

/** Read-only Supabase Auth snapshot for admin merchant tools UI. */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const { id } = await params;
    if (!isUuid(id)) {
      return routeBadRequest("Invalid user id");
    }

    const ctx = await loadMerchantAdminContext(id);
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    return NextResponse.json({
      success: true,
      auth: toAuthSnapshot(ctx.authUser),
    });
  } catch (error) {
    return routeError(error, { logContext: "admin/users/[id]/auth GET" });
  }
}
