import type { Metadata } from "next";
import { Suspense } from "react";
import { getMerchantAccountShell } from "@/lib/account/merchant-data";
import { MerchantAccountProvider } from "@/components/account/merchant-account-provider";
import { AccountLayoutClient } from "./account-layout-client";
import { AccountLoading } from "@/components/account/account-loading";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, wallets } = await getMerchantAccountShell();

  const displayName =
    user.user_metadata?.given_name ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Account";

  const initial = (
    user.user_metadata?.given_name ||
    user.user_metadata?.full_name ||
    user.email
  )
    ?.charAt(0)
    .toUpperCase() ?? "A";

  return (
    <Suspense fallback={<AccountLoading />}>
      <MerchantAccountProvider userId={user.id} initialWallets={wallets}>
        <AccountLayoutClient
          user={{
            email: user.email ?? "",
            displayName,
            initial,
          }}
        >
          {children}
        </AccountLayoutClient>
      </MerchantAccountProvider>
    </Suspense>
  );
}
