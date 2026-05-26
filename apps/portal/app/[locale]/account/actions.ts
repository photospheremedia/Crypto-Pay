"use server";

import { revalidatePath } from "next/cache";
import {
  getMerchantAuth,
  revalidateMerchantAccountData,
  revalidateMerchantProfile,
} from "@/lib/account/merchant-data";

/** Call after client-side profile/settings saves so RSC cache refreshes. */
export async function refreshMerchantProfileCache() {
  const { user } = await getMerchantAuth();
  revalidateMerchantProfile(user.id);
  revalidatePath("/account/settings");
  revalidatePath("/account/profile");
}

/** Call after wallet mutations (server actions already revalidate wallets). */
export async function refreshMerchantWalletCache() {
  const { user } = await getMerchantAuth();
  revalidateMerchantAccountData(user.id);
  revalidatePath("/account");
}
