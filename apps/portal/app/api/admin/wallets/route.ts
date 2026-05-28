import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { routeError, routeUnauthorized } from "@/lib/api/route-error";
import { checkAdminAccess } from "@/lib/admin-auth";
import { assertMerchantAccount } from "@/lib/admin/merchant-directory";
import { routeForbidden } from "@/lib/api/route-error";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { logEmailWorkflow, runWalletStatusEmailWorkflow } from "@/lib/email/workflows";
import { isSmsWorkflowSkipped, logSmsWorkflow, runWalletStatusSmsWorkflow } from "@/lib/sms/workflows";
import { merchantWallets } from "@/lib/wallets/db";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const status = req.nextUrl.searchParams.get("status") ?? "pending";
    const userId = req.nextUrl.searchParams.get("user")?.trim();
    const supabase = getSupabaseServiceClient();

    if (userId) {
      const peek = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      const check = await assertMerchantAccount(supabase, userId, peek.data?.email);
      if (!check.ok) {
        return routeForbidden(check.error);
      }
    }

    let query = merchantWallets(supabase)
      .select("*")
      .order("verification_requested_at", { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Admin Wallets] list error:", error);
      return NextResponse.json({ error: "Failed to load wallets" }, { status: 500 });
    }

    const rows = (data ?? []) as MerchantWallet[];
    const userIds = [...new Set(rows.map((w) => w.user_id))];
    const profiles = new Map<string, { email: string; full_name: string | null }>();

    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("user_profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      for (const p of profileRows ?? []) {
        profiles.set(p.id, { email: p.email, full_name: p.full_name });
      }
    }

    const wallets = rows.map((w) => ({
      ...w,
      merchant: profiles.get(w.user_id) ?? null,
    }));

    return NextResponse.json({ success: true, wallets });
  } catch (error) {
    return routeError(error, { logContext: "admin/wallets GET" });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const body = await parseRequestJson<{
      id?: string;
      status?: "verified" | "rejected";
      rejection_reason?: string;
    }>(req);
    if (body instanceof Response) return body;

    const { id, status, rejection_reason: rawRejectionReason } = body;

    if (!id || !status || !["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rejection_reason =
      status === "rejected" && typeof rawRejectionReason === "string"
        ? rawRejectionReason.trim().slice(0, 1000) || null
        : null;

    const supabase = getSupabaseServiceClient();

    const { data: existing, error: loadError } = await merchantWallets(supabase)
      .select(
        "id, user_id, label, status, verification_requested_at, merchant_status_emailed_for_request",
      )
      .eq("id", id)
      .maybeSingle();

    if (loadError || !existing) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({
        success: true,
        status: existing.status,
        merchantNotification: {
          sent: false,
          skipped: "not_from_pending",
        },
      });
    }

    const verificationRequestedAt = existing.verification_requested_at;
    const isVerified = status === "verified";
    const updates = {
      status,
      // Keep verification fields aligned with actual final status.
      verified_at: isVerified ? new Date().toISOString() : null,
      verified_by: isVerified ? user.id : null,
      rejection_reason,
    };

    const { data: updated, error: updateError } = await merchantWallets(supabase)
      .update(updates)
      .eq("id", id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("[Admin Wallets] patch error:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({
        success: true,
        status,
        merchantNotification: { sent: false, skipped: "concurrent_review" },
      });
    }

    if (status === "verified") {
      const { data: row } = await merchantWallets(supabase)
        .select("wallet_network, wallet_address, is_primary, user_id")
        .eq("id", id)
        .single();

      if (row?.is_primary) {
        await supabase.from("user_wallet_profiles").upsert(
          {
            user_id: row.user_id,
            wallet_network: row.wallet_network,
            wallet_address: row.wallet_address,
            wallet_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
    }

    const service = getSupabaseServiceClient();
    const { data: authUser } = await service.auth.admin.getUserById(existing.user_id);
    const merchantEmail = authUser?.user?.email;

    let merchantNotification: {
      sent: boolean;
      skipped?: string;
      error?: string;
    } = { sent: false };

    let merchantSmsNotification: {
      sent: boolean;
      skipped?: string;
      error?: string;
    } = { sent: false };

    if (merchantEmail) {
      const { data: walletRow } = await merchantWallets(supabase)
        .select("wallet_network, wallet_address")
        .eq("id", id)
        .single();

      const previousStatus = existing.status;
      const result = await runWalletStatusEmailWorkflow({
        walletId: id,
        merchantEmail,
        merchantUserId: existing.user_id,
        label: existing.label,
        status,
        previousStatus,
        verificationRequestedAt: verificationRequestedAt,
        statusEmailedForRequest: existing.merchant_status_emailed_for_request,
        rejectionReason: rejection_reason,
        walletNetwork: walletRow?.wallet_network,
        walletAddress: walletRow?.wallet_address,
      });

      if ("skipped" in result) {
        merchantNotification = { sent: false, skipped: result.reason };
        logEmailWorkflow(`wallet.status.${id}.${status}`, {
          success: true,
          error: `skipped:${result.reason}`,
        });
      } else {
        merchantNotification = {
          sent: result.success,
          error: result.success ? undefined : result.error,
        };
        logEmailWorkflow(`wallet.status.${id}.${status}`, result);

        if (result.success) {
          await merchantWallets(supabase)
            .update({
              merchant_status_emailed_at: new Date().toISOString(),
              merchant_status_emailed_for_request: verificationRequestedAt,
            })
            .eq("id", id);
        }
      }
    }

    const smsResult = await runWalletStatusSmsWorkflow({
      walletId: id,
      merchantUserId: existing.user_id,
      label: existing.label,
      status,
      previousStatus: existing.status,
      verificationRequestedAt: verificationRequestedAt,
      rejectionReason: rejection_reason,
    });

    if (isSmsWorkflowSkipped(smsResult)) {
      merchantSmsNotification = { sent: false, skipped: smsResult.reason };
      logSmsWorkflow(`wallet.status.sms.${id}.${status}`, {
        success: true,
        error: `skipped:${smsResult.reason}`,
      });
    } else {
      merchantSmsNotification = {
        sent: smsResult.success,
        error: smsResult.success ? undefined : smsResult.error,
      };
      logSmsWorkflow(`wallet.status.sms.${id}.${status}`, smsResult);
    }

    return NextResponse.json({
      success: true,
      status,
      merchantNotification,
      merchantSmsNotification,
    });
  } catch (error) {
    return routeError(error, { logContext: "admin/wallets PATCH" });
  }
}
