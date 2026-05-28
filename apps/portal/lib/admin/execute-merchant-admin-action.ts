import "server-only";

import { notifyMerchantAdminMessage } from "@/lib/admin/notify-merchant-message";
import type { MerchantAdminContext } from "@/lib/admin/merchant-admin-context";
import {
  confirmMerchantEmailInSupabase,
  deleteMerchantInSupabase,
  logMerchantAdminAction,
  revokeMerchantSessionsGlobal,
  sendMerchantPasswordResetEmail,
  sendMerchantVerificationEmail,
  setMerchantBanInSupabase,
  syncMerchantMetadataFromProfile,
  toAuthSnapshot,
} from "@/lib/admin/merchant-supabase-admin";
import { adminResendWalletVerification } from "@/lib/admin/merchant-account-emails";
import { notifyMerchantAccountDeleted } from "@/lib/admin/merchant-account-emails";

export const MERCHANT_ADMIN_ACTIONS = [
  "send_email_verification",
  "send_password_reset",
  "revoke_sessions",
  "confirm_email",
  "ban_user",
  "unban_user",
  "sync_auth_metadata",
  "resend_wallet_verification",
  "delete_account",
] as const;

export type MerchantAdminAction = (typeof MERCHANT_ADMIN_ACTIONS)[number];

export function isMerchantAdminAction(value: string): value is MerchantAdminAction {
  return (MERCHANT_ADMIN_ACTIONS as readonly string[]).includes(value);
}

export type MerchantActionBody = {
  action: MerchantAdminAction;
  walletId?: string;
  notifyMerchant?: boolean;
};

export type MerchantActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
  emailSent?: boolean;
  merchantNotified?: boolean;
  adminNotified?: boolean;
  auth?: ReturnType<typeof toAuthSnapshot>;
};

export async function executeMerchantAdminAction(
  ctx: MerchantAdminContext,
  admin: { id: string; email: string | undefined; name?: string | null },
  body: MerchantActionBody,
): Promise<MerchantActionResponse> {
  const { action } = body;

  switch (action) {
    case "send_email_verification": {
      const result = await sendMerchantVerificationEmail({
        merchantUserId: ctx.merchantUserId,
        merchantEmail: ctx.merchantEmail,
      });
      if (!result.success) return { success: false, error: result.error };
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.send_email_verification",
      });
      return {
        success: true,
        message: result.message,
        messageId: result.messageId,
      };
    }

    case "send_password_reset": {
      const result = await sendMerchantPasswordResetEmail(ctx.merchantEmail);
      if (!result.success) return { success: false, error: result.error };
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.send_password_reset",
      });
      return {
        success: true,
        message: result.message,
        messageId: result.messageId,
      };
    }

    case "revoke_sessions": {
      const revoke = await revokeMerchantSessionsGlobal(ctx.merchantUserId);
      if (!revoke.success) return { success: false, error: revoke.error };

      let emailSent = false;
      if (body.notifyMerchant !== false) {
        const notify = await notifyMerchantSessionsRevoked({
          merchantEmail: ctx.merchantEmail,
          merchantName: ctx.merchantName,
          adminEmail: admin.email ?? "",
          adminName: admin.name ?? null,
          merchantUserId: ctx.merchantUserId,
          adminUserId: admin.id,
        });
        emailSent = notify.success;
      }

      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.revoke_sessions",
        after: { emailSent },
      });

      return {
        success: true,
        message: revoke.message ?? "All sessions revoked.",
        emailSent,
      };
    }

    case "confirm_email": {
      const result = await confirmMerchantEmailInSupabase(ctx.merchantUserId);
      if (!result.success) return { success: false, error: result.error };
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.confirm_email",
        after: result.data ? { ...result.data } : null,
      });
      return {
        success: true,
        message: result.message,
        auth: result.data,
      };
    }

    case "ban_user": {
      const result = await setMerchantBanInSupabase({
        userId: ctx.merchantUserId,
        banned: true,
      });
      if (!result.success) return { success: false, error: result.error };
      await revokeMerchantSessionsGlobal(ctx.merchantUserId);
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.ban",
        after: result.data ? { ...result.data } : null,
      });
      return {
        success: true,
        message: result.message,
        auth: result.data,
      };
    }

    case "unban_user": {
      const result = await setMerchantBanInSupabase({
        userId: ctx.merchantUserId,
        banned: false,
      });
      if (!result.success) return { success: false, error: result.error };
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.unban",
        after: result.data ? { ...result.data } : null,
      });
      return {
        success: true,
        message: result.message,
        auth: result.data,
      };
    }

    case "sync_auth_metadata": {
      const { data: profile } = await ctx.service
        .from("user_profiles")
        .select("full_name, phone")
        .eq("id", ctx.merchantUserId)
        .maybeSingle();

      const result = await syncMerchantMetadataFromProfile({
        userId: ctx.merchantUserId,
        fullName: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
      });
      if (!result.success) return { success: false, error: result.error };
      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.sync_auth_metadata",
      });
      return { success: true, message: result.message };
    }

    case "resend_wallet_verification": {
      const walletId = body.walletId?.trim();
      if (!walletId) {
        return { success: false, error: "walletId is required" };
      }

      const result = await adminResendWalletVerification({
        walletId,
        merchantUserId: ctx.merchantUserId,
        adminUserId: admin.id,
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.resend_wallet_verification",
        after: { walletId },
      });

      return {
        success: true,
        message: "Wallet verification emails sent.",
        merchantNotified: result.merchantNotified,
        adminNotified: result.adminNotified,
      };
    }

    case "delete_account": {
      let emailSent = false;
      const notifyResult = await notifyMerchantAccountDeleted({
        merchantUserId: ctx.merchantUserId,
        merchantEmail: ctx.merchantEmail,
        merchantName: ctx.merchantName,
        adminEmail: admin.email ?? "",
        adminUserId: admin.id,
      });
      if (!notifyResult.success) {
        // Don't block account deletion if notification delivery fails.
        console.warn(
          "[merchant-admin] delete_account notification failed:",
          notifyResult.error,
        );
      } else {
        emailSent = true;
      }

      // Revoke active sessions before hard delete for immediate lockout.
      await revokeMerchantSessionsGlobal(ctx.merchantUserId);

      const result = await deleteMerchantInSupabase(ctx.merchantUserId);
      if (!result.success) return { success: false, error: result.error };

      await logMerchantAdminAction({
        actorUserId: admin.id,
        merchantUserId: ctx.merchantUserId,
        action: "merchant.delete_account",
        after: { emailSent },
      });

      return {
        success: true,
        message: emailSent
          ? "Merchant account deleted from Supabase Auth."
          : "Merchant account deleted. Notification email could not be sent.",
      };
    }

    default:
      return { success: false, error: "Unknown action" };
  }
}

async function notifyMerchantSessionsRevoked(params: {
  merchantEmail: string;
  merchantName?: string | null;
  adminEmail: string;
  adminName?: string | null;
  merchantUserId: string;
  adminUserId: string;
}) {
  return notifyMerchantAdminMessage({
    ...params,
    subject: "You have been signed out of all devices",
    message:
      "For your security, an administrator signed you out of all active Crypto Pay sessions. Sign in again with your email and password. If you did not expect this, contact support immediately.",
  });
}
