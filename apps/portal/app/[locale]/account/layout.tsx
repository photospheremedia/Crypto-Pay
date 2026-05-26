import type { Metadata } from "next";
import { Suspense } from "react";
import { requireMerchantSession } from "@/lib/auth/session";
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
  const { user } = await requireMerchantSession();

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
      <AccountLayoutClient
        user={{
          email: user.email ?? "",
          displayName,
          initial,
        }}
      >
        {children}
      </AccountLayoutClient>
    </Suspense>
  );
}
