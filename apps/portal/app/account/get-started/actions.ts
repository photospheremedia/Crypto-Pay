"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { sendEmail } from "@/lib/email";

const walletSchema = z.object({
  walletNetwork: z.literal("btc"),
  walletAddress: z
    .string()
    .min(12, "Please enter a valid wallet address.")
    .max(255, "Wallet address is too long."),
});

export type WalletActionState = {
  error?: string;
  success?: string;
};

export async function saveWalletInfo(
  _prevState: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> {
  const payload = {
    walletNetwork: String(formData.get("wallet_network") || "btc"),
    walletAddress: String(formData.get("wallet_address") || "").trim(),
  };

  const parsed = walletSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please provide a valid wallet network and wallet address." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const submittedAt = new Date().toISOString();
  const { error } = await supabase
    .from("user_wallet_profiles")
    .upsert(
      {
        user_id: user.id,
        wallet_network: parsed.data.walletNetwork,
        wallet_address: parsed.data.walletAddress,
        wallet_verified: false,
        updated_at: submittedAt,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return { error: "We couldn't save wallet info right now. Please try again." };
  }

  const subject = "Wallet Info Updated - Crypto Pay Client";
  const html = `
    <h2>Client wallet details updated</h2>
    <p><strong>Client email:</strong> ${user.email ?? "unknown"}</p>
    <p><strong>Wallet network:</strong> ${parsed.data.walletNetwork.toUpperCase()}</p>
    <p><strong>Wallet address:</strong> ${parsed.data.walletAddress}</p>
    <p><strong>Routing preference:</strong> BTC (handled by settlement worker)</p>
    <p><strong>Updated at:</strong> ${submittedAt}</p>
    <p><strong>User ID:</strong> ${user.id}</p>
  `;
  const text = [
    "Client wallet details updated",
    `Client email: ${user.email ?? "unknown"}`,
    `Wallet network: ${parsed.data.walletNetwork.toUpperCase()}`,
    `Wallet address: ${parsed.data.walletAddress}`,
    "Routing preference: BTC (handled by settlement worker)",
    `Updated at: ${submittedAt}`,
    `User ID: ${user.id}`,
  ].join("\n");

  const emailResult = await sendEmail({
    to: { email: "photospheremedia00@gmail.com" },
    subject,
    html,
    text,
    tags: ["wallet", "account-update"],
    workflow: { event: "wallet.profile_updated", entityId: user.id, actorId: user.id },
  });

  if (!emailResult.success) {
    console.error("[Wallet] Admin notification failed:", emailResult.error);
  }

  return { success: "Wallet info saved. We'll use this for your onboarding setup." };
}
