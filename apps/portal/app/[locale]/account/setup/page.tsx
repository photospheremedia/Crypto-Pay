import { redirect } from "next/navigation";
import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";

/** Legacy route — email links and old redirects land here. */
export default function AccountSetupPage() {
  redirect(ACCOUNT_WALLET_SETUP_PATH);
}
