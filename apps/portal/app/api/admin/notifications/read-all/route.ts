import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import {
  buildAdminNotifications,
  getReadNotificationIds,
  markAllNotificationsRead,
} from "@/lib/admin/notifications-feed";

export const POST = withAdminAuth(async (_req, { user }) => {
  try {
    const supabase = await createClient();
    const readIds = await getReadNotificationIds(user.id);
    const notifications = await buildAdminNotifications(supabase, readIds);
    const ids = notifications.map((n) => n.id);
    await markAllNotificationsRead(user.id, ids);

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 },
    );
  }
});
