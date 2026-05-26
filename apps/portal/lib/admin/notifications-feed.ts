import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { merchantWallets } from "@/lib/wallets/db";

export type AdminNotificationType = "lead" | "wallet";

export type AdminNotificationItem = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
};

const COOKIE_PREFIX = "admin_notif_read";

function cookieName(userId: string) {
  return `${COOKIE_PREFIX}_${userId}`;
}

export async function getReadNotificationIds(
  userId: string,
): Promise<Set<string>> {
  const jar = await cookies();
  const raw = jar.get(cookieName(userId))?.value;
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export async function appendReadNotificationId(
  userId: string,
  notificationId: string,
): Promise<void> {
  const jar = await cookies();
  const read = await getReadNotificationIds(userId);
  read.add(notificationId);
  jar.set(cookieName(userId), JSON.stringify([...read]), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function markAllNotificationsRead(
  userId: string,
  ids: string[],
): Promise<void> {
  const jar = await cookies();
  const read = await getReadNotificationIds(userId);
  for (const id of ids) read.add(id);
  jar.set(cookieName(userId), JSON.stringify([...read]), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    httpOnly: true,
  });
}

function truncateAddress(address: string, chars = 8) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export async function buildAdminNotifications(
  supabase: SupabaseClient,
  readIds: Set<string>,
): Promise<AdminNotificationItem[]> {
  const items: AdminNotificationItem[] = [];

  const [pendingWalletsRes, newLeadsRes] = await Promise.all([
    merchantWallets(supabase)
      .select(
        "id, user_id, label, wallet_network, wallet_address, verification_requested_at, created_at",
      )
      .eq("status", "pending")
      .order("verification_requested_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(15),
    supabase
      .from("chat_conversations")
      .select("id, guest_name, guest_email, guest_phone, started_at")
      .eq("contact_captured", true)
      .eq("lead_status", "new")
      .order("started_at", { ascending: false })
      .limit(15),
  ]);

  const pendingWallets = pendingWalletsRes.data;

  for (const wallet of pendingWallets ?? []) {
    const id = `wallet-${wallet.id}`;
    items.push({
      id,
      type: "wallet",
      title: "Payout wallet pending review",
      message: `${wallet.label || wallet.wallet_network} · ${truncateAddress(wallet.wallet_address)}`,
      href: "/admin/wallets",
      read: readIds.has(id),
      createdAt:
        wallet.verification_requested_at ??
        wallet.created_at ??
        new Date().toISOString(),
    });
  }

  for (const lead of newLeadsRes.data ?? []) {
    const id = `lead-${lead.id}`;
    const name =
      lead.guest_name || lead.guest_email || lead.guest_phone || "New lead";
    items.push({
      id,
      type: "lead",
      title: "New lead",
      message: name,
      href: `/admin/leads?id=${lead.id}`,
      read: readIds.has(id),
      createdAt: lead.started_at ?? new Date().toISOString(),
    });
  }

  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
