"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { useMerchantWallets } from "@/lib/hooks/use-merchant-wallets";

type MerchantAccountContextValue = {
  wallets: MerchantWalletPublic[];
  userId: string;
  pendingWalletCount: number;
  hasVerifiedWallet: boolean;
  refreshWallets: () => Promise<MerchantWalletPublic[] | undefined>;
};

const MerchantAccountContext = createContext<MerchantAccountContextValue | null>(
  null,
);

export function MerchantAccountProvider({
  children,
  userId,
  initialWallets,
}: {
  children: ReactNode;
  userId: string;
  initialWallets: MerchantWalletPublic[];
}) {
  const { wallets, pendingWalletCount, hasVerifiedWallet, refresh } =
    useMerchantWallets(initialWallets);

  const value = useMemo(
    () => ({
      wallets,
      userId,
      pendingWalletCount,
      hasVerifiedWallet,
      refreshWallets: refresh,
    }),
    [wallets, userId, pendingWalletCount, hasVerifiedWallet, refresh],
  );

  return (
    <MerchantAccountContext.Provider value={value}>
      {children}
    </MerchantAccountContext.Provider>
  );
}

export function useMerchantAccount(): MerchantAccountContextValue {
  const ctx = useContext(MerchantAccountContext);
  if (!ctx) {
    throw new Error(
      "useMerchantAccount must be used within MerchantAccountProvider",
    );
  }
  return ctx;
}
