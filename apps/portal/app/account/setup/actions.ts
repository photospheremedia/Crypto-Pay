"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { sendEmail } from "@/lib/email/sender";

const onboardingSchema = z.object({
  selectedPlan: z.enum(["starter", "pro", "business"]),
  websiteUrl: z.string().trim().url().max(255),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number (e.g. +14155552671)."),
  businessAddress: z
    .string()
    .trim()
    .min(8, "Business address is too short.")
    .max(180, "Business address is too long.")
    .regex(
      /^[a-zA-Z0-9\s.,'#/-]+$/,
      "Business address contains invalid characters.",
    ),
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
    phone: String(formData.get("phone") || ""),
    businessAddress: String(formData.get("business_address") || ""),
  };

  const parsed = onboardingSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return {
      error:
        firstIssue ||
        "Please select a plan and provide valid website, email, phone, and address details.",
    };
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
      phone: parsed.data.phone,
      business_address: parsed.data.businessAddress,
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
    <p><strong>Phone:</strong> ${parsed.data.phone}</p>
    <p><strong>Business address:</strong> ${parsed.data.businessAddress}</p>
    <p><strong>Selected plan:</strong> ${selectedPlanLabel}</p>
    <p><strong>Timestamp:</strong> ${submittedAt}</p>
    <p><strong>User ID:</strong> ${user.id}</p>
  `;
  const text = [
    "New customer onboarding submission",
    `Customer email: ${parsed.data.email}`,
    `Website URL: ${parsed.data.websiteUrl}`,
    `Phone: ${parsed.data.phone}`,
    `Business address: ${parsed.data.businessAddress}`,
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
    workflow: { event: "lead.onboarding_submitted", entityId: user.id, actorId: user.id },
  });

  if (!emailResult.success) {
    console.error("[Onboarding] Lead notification email failed:", emailResult.error);
  }

  redirect("/account?onboarding=submitted");
}
