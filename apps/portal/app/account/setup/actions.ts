"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { sendEmail } from "@/lib/email";

const onboardingSchema = z.object({
  selectedPlan: z.enum(["starter", "pro", "business"]),
  websiteUrl: z.string().url().max(255),
  email: z.string().email().max(255),
});

export type OnboardingState = {
  error?: string;
};

export async function submitOnboardingLead(
  _prevState: OnboardingState,
  formData: FormData,
) {
  const payload = {
    selectedPlan: String(formData.get("selected_plan") || ""),
    websiteUrl: String(formData.get("website_url") || ""),
    email: String(formData.get("email") || ""),
  };

  const parsed = onboardingSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please select a plan and provide a valid website URL and email." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = getSupabaseServiceClient();
  const submittedAt = new Date().toISOString();
  const selectedPlanLabel = (() => {
    switch (parsed.data.selectedPlan) {
      case "starter":
        return "Starter";
      case "pro":
        return "Pro";
      case "business":
        return "Business";
      default:
        return parsed.data.selectedPlan;
    }
  })();

  const leadPayload = {
    user_id: user.id,
    email: parsed.data.email,
    source: "onboarding_flow",
    status: "setup_in_progress",
    notes: JSON.stringify({
      selected_plan: selectedPlanLabel,
      website_url: parsed.data.websiteUrl,
      submitted_at: submittedAt,
    }),
    converted_at: submittedAt,
  };

  const { error: leadError } = await service
    .from("leads")
    .upsert(leadPayload, { onConflict: "email" });

  if (leadError) {
    return { error: "We couldn't save your setup details. Please try again." };
  }

  const emailSubject = "New CryptoPay Lead – New Customer Signup";
  const html = `
    <h2>New customer onboarding submission</h2>
    <p><strong>Customer email:</strong> ${parsed.data.email}</p>
    <p><strong>Website URL:</strong> ${parsed.data.websiteUrl}</p>
    <p><strong>Selected plan:</strong> ${selectedPlanLabel}</p>
    <p><strong>Timestamp:</strong> ${submittedAt}</p>
    <p><strong>User ID:</strong> ${user.id}</p>
  `;
  const text = [
    "New customer onboarding submission",
    `Customer email: ${parsed.data.email}`,
    `Website URL: ${parsed.data.websiteUrl}`,
    `Selected plan: ${selectedPlanLabel}`,
    `Timestamp: ${submittedAt}`,
    `User ID: ${user.id}`,
  ].join("\n");

  const emailResult = await sendEmail({
    to: { email: "photospheremedia00@gmail.com" },
    subject: emailSubject,
    html,
    text,
    tags: ["lead", "onboarding"],
  });

  if (!emailResult.success) {
    console.error("[Onboarding] Lead notification email failed:", emailResult.error);
  }

  redirect("/account?onboarding=submitted");
}
