import "server-only";

import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ADMIN_HOME_PATH,
  MERCHANT_HOME_PATH,
} from "@/lib/auth/user-realm";
import { resolveRealmForUserEdge } from "@/lib/auth/resolve-realm-edge";
import { listUserMerchantWallets } from "@/lib/wallets/db";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import type { Database } from "@/lib/database.types";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { toPublicMerchantWallets } from "@/lib/wallets/merchant-wallet-public";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];

export const MERCHANT_WALLETS_CACHE_TAG = "merchant-wallets";
export const MERCHANT_PROFILE_CACHE_TAG = "merchant-profile";

const MERCHANT_DATA_REVALIDATE_SEC = 20;

export function merchantWalletsCacheTag(userId: string) {
  return `merchant-wallets-${userId}`;
}

export function merchantProfileCacheTag(userId: string) {
  return `merchant-profile-${userId}`;
}

export function revalidateMerchantWallets(userId: string) {
  revalidateTag(MERCHANT_WALLETS_CACHE_TAG, { expire: 0 });
  revalidateTag(merchantWalletsCacheTag(userId), { expire: 0 });
}

export function revalidateMerchantProfile(userId: string) {
  revalidateTag(MERCHANT_PROFILE_CACHE_TAG, { expire: 0 });
  revalidateTag(merchantProfileCacheTag(userId), { expire: 0 });
}

export function revalidateMerchantAccountData(userId: string) {
  revalidateMerchantWallets(userId);
  revalidateMerchantProfile(userId);
}

async function fetchMerchantWalletsUncached(
  userId: string,
): Promise<MerchantWalletPublic[]> {
  const supabase = getSupabaseServiceClient();
  const rows = await listUserMerchantWallets(supabase, userId);
  return toPublicMerchantWallets(rows);
}

async function fetchMerchantProfileUncached(userId: string): Promise<{
  profile: UserProfile | null;
  settings: UserSettings | null;
}> {
  const supabase = getSupabaseServiceClient();
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    profile: profile ?? null,
    settings: settings ?? null,
  };
}

/** Cached wallet list — service role + user id; invalidated on wallet mutations. */
export function getMerchantWalletsCached(userId: string) {
  return unstable_cache(
    () => fetchMerchantWalletsUncached(userId),
    [merchantWalletsCacheTag(userId)],
    {
      revalidate: MERCHANT_DATA_REVALIDATE_SEC,
      tags: [MERCHANT_WALLETS_CACHE_TAG, merchantWalletsCacheTag(userId)],
    },
  )();
}

/** Cached profile + settings — shared across settings/profile pages. */
export function getMerchantProfileCached(userId: string) {
  return unstable_cache(
    () => fetchMerchantProfileUncached(userId),
    [merchantProfileCacheTag(userId)],
    {
      revalidate: MERCHANT_DATA_REVALIDATE_SEC,
      tags: [MERCHANT_PROFILE_CACHE_TAG, merchantProfileCacheTag(userId)],
    },
  )();
}

/** One auth + realm check per RSC request (deduped across layout + pages). */
export const getMerchantAuth = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(MERCHANT_HOME_PATH)}`);
  }

  const realm = await resolveRealmForUserEdge(supabase, user);
  if (realm === "admin") {
    redirect(ADMIN_HOME_PATH);
  }

  return { supabase, user };
});

/** Auth + cached wallets for account layout (one wallet fetch per navigation). */
export const getMerchantAccountShell = cache(async () => {
  const { supabase, user } = await getMerchantAuth();
  const wallets = await getMerchantWalletsCached(user.id);
  return { supabase, user, wallets };
});

/** Profile + settings in one parallel fetch per request (cached). */
export const getMerchantProfileBundle = cache(async () => {
  const { user } = await getMerchantAuth();
  const { profile, settings } = await getMerchantProfileCached(user.id);
  return { user, profile, settings };
});
