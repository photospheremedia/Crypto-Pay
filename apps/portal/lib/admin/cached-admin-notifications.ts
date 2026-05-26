import "server-only";

import { unstable_cache } from "next/cache";
import {
  buildAdminNotifications,
  type AdminNotificationItem,
} from "@/lib/admin/notifications-feed";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

const NOTIFICATIONS_CACHE_SEC = 30;

export const ADMIN_NOTIFICATIONS_CACHE_TAG = "admin-notifications";

async function fetchNotificationsUncached(): Promise<
  Omit<AdminNotificationItem, "read">[]
> {
  const supabase = getSupabaseServiceClient();
  const items = await buildAdminNotifications(supabase, new Set());
  return items.map(({ read: _read, ...rest }) => rest);
}

/** Shared notification payload (read state applied per user in the route). */
export function getCachedAdminNotificationItems() {
  return unstable_cache(fetchNotificationsUncached, ["admin-notifications"], {
    revalidate: NOTIFICATIONS_CACHE_SEC,
    tags: [ADMIN_NOTIFICATIONS_CACHE_TAG],
  })();
}
