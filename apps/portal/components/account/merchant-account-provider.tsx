"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { MerchantWallet } from "@/types/crypto-pay-db";

type MerchantAccountContextValue = {
  wallets: MerchantWallet[];
  userId: string;
  pendingWalletCount: number;
  hasVerifiedWallet: boolean;
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
  initialWallets: MerchantWallet[];
}) {
  const value = useMemo(() => {
    const pendingWalletCount = initialWallets.filter(
      (w) => w.status === "pending",
    ).length;
    const hasVerifiedWallet = initialWallets.some(
      (w) => w.status === "verified",
    );
    return {
      wallets: initialWallets,
      userId,
      pendingWalletCount,
      hasVerifiedWallet,
    };
  }, [initialWallets, userId]);

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
