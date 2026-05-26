"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AdminNotificationTypeIcon } from "@/components/admin/admin-notification-type-icon";
import type { AdminNotificationType } from "@/lib/admin/notifications-feed";

type NotificationItem = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  async function markAsRead(id: string) {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function markAllAsRead() {
    await fetch("/api/admin/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            Pending payout wallets and new leads from Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadNotifications()} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={() => void markAllAsRead()} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
          {unreadCount} unread of {notifications.length} total
        </div>
        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500">
            <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Nothing new right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between gap-4 px-6 py-4 ${
                  notification.read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-slate-100 p-2">
                    <AdminNotificationTypeIcon type={notification.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {notification.href ? (
                    <Link
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      href={notification.href}
                    >
                      Open
                    </Link>
                  ) : null}
                  {!notification.read ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void markAsRead(notification.id)}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
