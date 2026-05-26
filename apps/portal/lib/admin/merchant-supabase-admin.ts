import "server-only";

import type { AuthError, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { appAbsoluteUrl } from "@/lib/email/routing";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "@/lib/email/triggers";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { writeAuditLog } from "@/lib/audit";

export type MerchantAuthSnapshot = {
  id: string;
  email: string;
  emailConfirmed: boolean;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  bannedUntil: string | null;
  isBanned: boolean;
  providers: string[];
  phone: string | null;
};

export type AdminToolResult<T extends Record<string, unknown> = Record<string, unknown>> =
  {
    success: boolean;
    error?: string;
    message?: string;
    messageId?: string;
    data?: T;
  };

type AuthLinkType = "magiclink" | "recovery" | "invite";

function authCallbackUrl(next = "/account"): string {
  return appAbsoluteUrl(`/auth/callback?next=${encodeURIComponent(next)}`);
}

function displayName(user: User): string | undefined {
  const meta = user.user_metadata;
  if (typeof meta?.full_name === "string" && meta.full_name) return meta.full_name;
  if (typeof meta?.given_name === "string" && meta.given_name) return meta.given_name;
  return undefined;
}

function isBanned(user: User): boolean {
  if (!user.banned_until) return false;
  return new Date(user.banned_until).getTime() > Date.now();
}

function authErrorMessage(error: AuthError | null | undefined, fallback: string): string {
  return error?.message?.trim() || fallback;
}

export function getServiceClient(): SupabaseClient {
  return getSupabaseServiceClient();
}

export async function fetchMerchantAuthUser(
  service: SupabaseClient,
  userId: string,
): Promise<{ user: User | null; error?: string }> {
  const { data, error } = await service.auth.admin.getUserById(userId);
  if (error) {
    return { user: null, error: authErrorMessage(error, "Failed to load auth user") };
  }
  if (!data?.user?.email) {
    return { user: null, error: "Auth user not found" };
  }
  return { user: data.user };
}

export function toAuthSnapshot(user: User): MerchantAuthSnapshot {
  const providers = Array.isArray(user.app_metadata?.providers)
    ? (user.app_metadata.providers as string[])
    : user.app_metadata?.provider
      ? [String(user.app_metadata.provider)]
      : [];

  return {
    id: user.id,
    email: user.email ?? "",
    emailConfirmed: Boolean(user.email_confirmed_at),
    emailConfirmedAt: user.email_confirmed_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at,
    bannedUntil: user.banned_until ?? null,
    isBanned: isBanned(user),
    providers,
    phone: user.phone ?? null,
  };
}

export async function fetchMerchantAuthSnapshot(
  userId: string,
): Promise<AdminToolResult<MerchantAuthSnapshot>> {
  const service = getServiceClient();
  const { user, error } = await fetchMerchantAuthUser(service, userId);
  if (!user) {
    return { success: false, error };
  }
  return { success: true, data: toAuthSnapshot(user) };
}

export async function generateMerchantAuthLink(params: {
  email: string;
  type: AuthLinkType;
}): Promise<AdminToolResult<{ actionLink: string }>> {
  const service = getServiceClient();

  const { data, error } = await service.auth.admin.generateLink({
    type: params.type,
    email: params.email,
    options: { redirectTo: authCallbackUrl("/account") },
  });

  if (error || !data?.properties?.action_link) {
    return {
      success: false,
      error: authErrorMessage(error, "Could not generate Supabase auth link"),
    };
  }

  return {
    success: true,
    data: { actionLink: data.properties.action_link },
  };
}

export async function sendMerchantVerificationEmail(params: {
  merchantUserId: string;
  merchantEmail: string;
}): Promise<AdminToolResult> {
  const service = getServiceClient();
  const link = await generateMerchantAuthLink({
    email: params.merchantEmail,
    type: "magiclink",
  });
  if (!link.success || !link.data?.actionLink) {
    return { success: false, error: link.error };
  }

  const { user } = await fetchMerchantAuthUser(service, params.merchantUserId);
  const emailResult = await sendEmailVerification(params.merchantEmail, {
    firstName: user ? displayName(user) : undefined,
    verificationUrl: link.data.actionLink,
  });

  if (!emailResult.success) {
    return { success: false, error: emailResult.error ?? "Resend failed" };
  }

  return {
    success: true,
    message: "Verification link generated in Supabase and sent via Resend.",
    messageId: emailResult.messageId,
  };
}

export async function sendMerchantPasswordResetEmail(
  merchantEmail: string,
): Promise<AdminToolResult> {
  const link = await generateMerchantAuthLink({
    email: merchantEmail,
    type: "recovery",
  });
  if (!link.success || !link.data?.actionLink) {
    return { success: false, error: link.error };
  }

  const emailResult = await sendPasswordResetEmail(merchantEmail, {
    resetUrl: link.data.actionLink,
    requestTime: new Date().toLocaleString(),
  });

  if (!emailResult.success) {
    return { success: false, error: emailResult.error ?? "Resend failed" };
  }

  return {
    success: true,
    message: "Password reset link generated in Supabase and sent via Resend.",
    messageId: emailResult.messageId,
  };
}

/** Signs the user out of all devices (Supabase Auth Admin API). */
export async function revokeMerchantSessionsGlobal(
  userId: string,
): Promise<AdminToolResult<{ sessionsRevoked: boolean }>> {
  const service = getServiceClient();
  const { error } = await service.auth.admin.signOut(userId, "global");

  if (error) {
    return {
      success: false,
      error: authErrorMessage(error, "Failed to revoke sessions"),
    };
  }

  return {
    success: true,
    message: "All Supabase sessions revoked.",
    data: { sessionsRevoked: true },
  };
}

export async function confirmMerchantEmailInSupabase(
  userId: string,
): Promise<AdminToolResult<MerchantAuthSnapshot>> {
  const service = getServiceClient();
  const { data, error } = await service.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: authErrorMessage(error, "Failed to confirm email in Supabase"),
    };
  }

  return {
    success: true,
    message: "Email marked confirmed in Supabase Auth.",
    data: toAuthSnapshot(data.user),
  };
}

export async function setMerchantBanInSupabase(params: {
  userId: string;
  banned: boolean;
}): Promise<AdminToolResult<MerchantAuthSnapshot>> {
  const service = getServiceClient();
  const { data, error } = await service.auth.admin.updateUserById(params.userId, {
    ban_duration: params.banned ? "876000h" : "none",
  });

  if (error || !data.user) {
    return {
      success: false,
      error: authErrorMessage(
        error,
        params.banned ? "Failed to ban user" : "Failed to unban user",
      ),
    };
  }

  return {
    success: true,
    message: params.banned
      ? "User banned in Supabase Auth (sessions invalidated)."
      : "User unbanned in Supabase Auth.",
    data: toAuthSnapshot(data.user),
  };
}

export async function syncMerchantMetadataFromProfile(params: {
  userId: string;
  fullName: string | null;
  phone: string | null;
}): Promise<AdminToolResult> {
  const service = getServiceClient();
  const { user, error: loadError } = await fetchMerchantAuthUser(service, params.userId);
  if (!user) {
    return { success: false, error: loadError };
  }

  const metadata = {
    ...(user.user_metadata ?? {}),
    ...(params.fullName ? { full_name: params.fullName } : {}),
    ...(params.phone ? { phone: params.phone } : {}),
  };

  const { error } = await service.auth.admin.updateUserById(params.userId, {
    user_metadata: metadata,
  });

  if (error) {
    return {
      success: false,
      error: authErrorMessage(error, "Failed to sync auth metadata"),
    };
  }

  return {
    success: true,
    message: "Supabase user_metadata updated from profile.",
  };
}

export async function deleteMerchantInSupabase(
  userId: string,
): Promise<AdminToolResult> {
  const service = getServiceClient();
  const { error } = await service.auth.admin.deleteUser(userId);

  if (error) {
    return {
      success: false,
      error: authErrorMessage(error, "Failed to delete user in Supabase"),
    };
  }

  return { success: true, message: "User deleted from Supabase Auth." };
}

export async function logMerchantAdminAction(params: {
  actorUserId: string;
  merchantUserId: string;
  action: string;
  after?: Record<string, unknown> | null;
}) {
  try {
    await writeAuditLog({
      tenantId: null,
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: "merchant_user",
      entityId: params.merchantUserId,
      after: params.after ?? null,
    });
  } catch (error) {
    console.warn("[merchant-supabase-admin] audit log failed:", error);
  }
}
