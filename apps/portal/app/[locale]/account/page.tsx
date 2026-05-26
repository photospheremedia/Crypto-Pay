import { AccountDashboard } from "@/components/account/account-dashboard";
import {
  getMerchantAuth,
  getMerchantWalletsCached,
} from "@/lib/account/merchant-data";

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

  const { user } = await getMerchantAuth();
  const wallets = await getMerchantWalletsCached(user.id);

  return (
    <AccountDashboard
      user={user}
      wallets={wallets}
      initialTab={initialTab}
    />
  );
}
