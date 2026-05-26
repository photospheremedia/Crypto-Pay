import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import {
  buildAdminNotifications,
  getReadNotificationIds,
} from "@/lib/admin/notifications-feed";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export const GET = withAdminAuth(async (_req, { user }) => {
  try {
    const supabase = getSupabaseServiceClient();
    const readIds = await getReadNotificationIds(user.id);
    const notifications = await buildAdminNotifications(supabase, readIds);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
});
