import { redirect } from "next/navigation";
import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";

/** Legacy route — wallet onboarding lives on the account dashboard. */
export default function AccountGetStartedPage() {
  redirect(ACCOUNT_WALLET_SETUP_PATH);
}
