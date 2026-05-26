/** Wallet onboarding tab on the account dashboard. */
export const ACCOUNT_WALLET_SETUP_PATH = "/account?tab=wallets";

/** Legacy signup/email links; kept as a redirect route. */
export const ACCOUNT_SETUP_LEGACY_PATH = "/account/setup";

export function accountWalletSetupCallbackUrl(appUrl: string): string {
  const next = encodeURIComponent(ACCOUNT_WALLET_SETUP_PATH);
  return `${appUrl}/auth/callback?next=${next}`;
}
