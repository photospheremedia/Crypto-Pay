import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { appendReadNotificationId } from "@/lib/admin/notifications-feed";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { user, isAdmin } = await checkAdminAccess();

  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: !user ? "Unauthorized" : "Forbidden" },
      { status: !user ? 401 : 403 },
    );
  }

  try {
    const { id } = await context.params;
    await appendReadNotificationId(user.id, id);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
