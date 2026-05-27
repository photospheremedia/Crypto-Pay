"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { MerchantWalletsPanel } from "@/components/account/wallets/merchant-wallets-panel";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";

const VALID_TABS = ["overview", "wallets", "activity"] as const;
type AccountTab = (typeof VALID_TABS)[number];

function parseTab(value: string | null | undefined): AccountTab {
  if (value && VALID_TABS.includes(value as AccountTab)) {
    return value as AccountTab;
  }
  return "overview";
}

/** Merchant wallet UI — list/add/edit/delete via `/api/account/wallets`. */
export function MerchantWalletDashboard({
  wallets,
  initialTab = "overview",
  showHeader = true,
  autoOpenAddWallet = false,
}: {
  wallets: MerchantWalletPublic[];
  /** @deprecated SWR refreshes after mutations; no-op kept for compatibility. */
  onRefresh?: () => void;
  initialTab?: string;
  showHeader?: boolean;
  autoOpenAddWallet?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onTabChange(tab: AccountTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <MerchantWalletsPanel
      initialWallets={wallets}
      initialTab={parseTab(initialTab)}
      showHeader={showHeader}
      autoOpenAddWallet={autoOpenAddWallet}
      onTabChange={onTabChange}
    />
  );
}
