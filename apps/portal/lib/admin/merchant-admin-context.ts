import "server-only";

import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertMerchantAccount } from "@/lib/admin/merchant-directory";
import {
  fetchMerchantAuthUser,
  getServiceClient,
} from "@/lib/admin/merchant-supabase-admin";

export type MerchantAdminContext = {
  service: SupabaseClient;
  merchantUserId: string;
  merchantEmail: string;
  merchantName: string | null;
  authUser: User;
};

export type MerchantAdminContextError = {
  ok: false;
  status: number;
  error: string;
};

export type MerchantAdminContextResult =
  | ({ ok: true } & MerchantAdminContext)
  | MerchantAdminContextError;

export async function loadMerchantAdminContext(
  merchantUserId: string,
): Promise<MerchantAdminContextResult> {
  const service = getServiceClient();

  const { data: profile } = await service
    .from("user_profiles")
    .select("email, full_name, phone")
    .eq("id", merchantUserId)
    .maybeSingle();

  const merchantCheck = await assertMerchantAccount(
    service,
    merchantUserId,
    profile?.email,
  );
  if (!merchantCheck.ok) {
    return { ok: false, status: 403, error: merchantCheck.error };
  }

  const { user: authUser, error: authError } = await fetchMerchantAuthUser(
    service,
    merchantUserId,
  );
  if (!authUser?.email) {
    return { ok: false, status: 404, error: authError ?? "Merchant not found" };
  }

  return {
    ok: true,
    service,
    merchantUserId,
    merchantEmail: authUser.email,
    merchantName:
      profile?.full_name ??
      (authUser.user_metadata?.full_name as string | undefined) ??
      null,
    authUser,
  };
}
