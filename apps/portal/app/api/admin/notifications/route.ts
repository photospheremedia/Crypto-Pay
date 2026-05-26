import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { getCachedAdminNotificationItems } from "@/lib/admin/cached-admin-notifications";
import { getReadNotificationIds } from "@/lib/admin/notifications-feed";

export const runtime = "nodejs";
export const revalidate = 30;

export const GET = withAdminAuth(async (_req, { user }) => {
  try {
    const readIds = await getReadNotificationIds(user.id);
    const items = await getCachedAdminNotificationItems();
    const notifications = items.map((item) => ({
      ...item,
      read: readIds.has(item.id),
    }));

    return NextResponse.json(
      {
        success: true,
        notifications,
      },
      {
        headers: {
          "Cache-Control":
            "private, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
});
