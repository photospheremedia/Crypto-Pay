import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Auth check - this runs once per request
  const { user, isAdmin } = await checkAdminAccess();
  
  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: !user ? "Unauthorized" : "Forbidden" }, 
      { status: !user ? 401 : 403 }
    );
  }

  try {
    const params = await context.params;
    const notificationId = params.id;

    // In production, update the notification in the database
    // For now, just return success
    console.log(`Marking notification ${notificationId} as read for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
