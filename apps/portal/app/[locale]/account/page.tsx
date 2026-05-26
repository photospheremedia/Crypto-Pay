import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { listUserMerchantWallets } from "@/lib/wallets/db";

const VALID_TABS = ["overview", "wallets", "activity"] as const;

function parseTab(value: string | undefined): string {
  if (value && VALID_TABS.includes(value as (typeof VALID_TABS)[number])) {
    return value;
  }
  return "overview";
}

type AccountPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { tab: tabParam } = await searchParams;
  const initialTab = parseTab(tabParam);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const wallets = await listUserMerchantWallets(supabase, user.id);

  return (
    <AccountDashboard
      user={user}
      wallets={wallets}
      initialTab={initialTab}
    />
  );
}
