"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";
import { AdminNotificationTypeIcon } from "@/components/admin/admin-notification-type-icon";
import type { AdminNotificationType } from "@/lib/admin/notifications-feed";

interface Notification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-[200] mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 ? (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({unreadCount} unread)
                </span>
              ) : null}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Mark all read
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <Bell className="mb-3 h-12 w-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-900">
                  No notifications
                </p>
                <p className="text-xs text-slate-500">
                  New leads and wallet reviews will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      !notification.read
                        ? "bg-blue-50/80 hover:bg-blue-100/80"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      <AdminNotificationTypeIcon type={notification.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {notification.href ? (
                        <Link
                          href={notification.href}
                          onClick={() => {
                            void markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                          className="block"
                        >
                          <p className="mb-0.5 text-sm font-medium text-slate-900">
                            {notification.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-slate-600">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="mb-0.5 text-sm font-medium text-slate-900">
                            {notification.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-slate-600">
                            {notification.message}
                          </p>
                        </>
                      )}
                    </div>
                    {!notification.read ? (
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification.id)}
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                        aria-label="Mark as read"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="border-t border-slate-200 px-4 py-2">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="block py-1 text-center text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all notifications
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
