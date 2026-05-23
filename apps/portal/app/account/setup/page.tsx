import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { OnboardingForm } from "./onboarding-form";

export default async function AccountSetupPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    redirect("/account");
  }

  const { data: existingLead } = await supabase
    .from("leads")
    .select("id")
    .eq("user_id", user.id)
    .eq("source", "onboarding_flow")
    .limit(1);

  if (existingLead && existingLead.length > 0) {
    redirect("/account?onboarding=submitted");
  }

  return (
    <OnboardingForm defaultEmail={user.email || ""} />
  );
}
