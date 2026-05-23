import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";

export const POST = withAdminAuth(async (req, { user }) => {
  try {
    // In production, mark all notifications as read in the database
    console.log(`Marking all notifications as read for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
});
