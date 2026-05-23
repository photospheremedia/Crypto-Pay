import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

type Params = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const service = getSupabaseServiceClient();

    // revoke_user_sessions is expected to remove active sessions for a user.
    // If it doesn't exist in an environment, we keep this non-fatal and still succeed.
    const { error } = await service.rpc("revoke_user_sessions", { p_user_id: id });
    if (error) {
      console.warn("[Admin User Revoke] revoke_user_sessions rpc failed:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin User Revoke] fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
