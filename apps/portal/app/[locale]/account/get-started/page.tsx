import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { WalletGetStartedForm } from "./wallet-form";

export const metadata = {
  title: "Get Started Wallet Setup",
  description: "Add or update your wallet information for onboarding.",
};

export default async function AccountGetStartedPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: walletProfile } = await supabase
    .from("user_wallet_profiles")
    .select("wallet_network, wallet_address, wallet_verified, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Get Started</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Add your payout wallet</h1>
        <p className="mt-2 text-sm text-slate-600">
          We currently support Bitcoin payouts only.
        </p>

        <WalletGetStartedForm
          defaultAddress={walletProfile?.wallet_address ?? ""}
          walletVerified={walletProfile?.wallet_verified ?? false}
          updatedAt={walletProfile?.updated_at ?? null}
        />
      </div>
    </div>
  );
}
