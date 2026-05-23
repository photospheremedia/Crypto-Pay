import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";

export const GET = withAdminAuth(async (req, { user }) => {
  try {
    // Mock notifications for now - in production, fetch from database
    const notifications = [
      {
        id: "1",
        type: "lead",
        title: "New chat lead",
        message: "Potential customer interested in delivery integration",
        href: "/admin/leads",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: "2",
        type: "order",
        title: "New order received",
        message: "Order #1234 from Acme Restaurant - $1,245.50",
        href: "/admin/orders",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      },
      {
        id: "3",
        type: "product",
        title: "Low stock alert",
        message: "Premium Packaging Boxes - only 5 units remaining",
        href: "/admin/inventory",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
    ];

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
});
