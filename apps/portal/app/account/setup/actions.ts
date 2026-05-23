"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { slugify, withSuffix } from "@crypto-pay/shared/utils";

const setupSchema = z.object({
  orgName: z.string().min(2).max(120),
  orgType: z.string().min(2).max(80),
  legalName: z.string().max(160).optional(),
  tradeName: z.string().max(160).optional(),
  addressLine1: z.string().min(4).max(160),
  addressLine2: z.string().max(160).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  website: z.string().max(160).optional(),
});

export async function createOrganization(formData: FormData) {
  const payload = {
    orgName: String(formData.get("org_name") || ""),
    orgType: String(formData.get("org_type") || ""),
    legalName: String(formData.get("legal_name") || "") || undefined,
    tradeName: String(formData.get("trade_name") || "") || undefined,
    addressLine1: String(formData.get("address_line1") || ""),
    addressLine2: String(formData.get("address_line2") || "") || undefined,
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || ""),
    postalCode: String(formData.get("postal_code") || ""),
    country: String(formData.get("country") || ""),
    phone: String(formData.get("phone") || ""),
    website: String(formData.get("website") || "") || undefined,
  };

  const parsed = setupSchema.safeParse(payload);
  if (!parsed.success) {
    redirect(`/account/setup?error=${encodeURIComponent("Please complete all required fields.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = getSupabaseServiceClient();
  const baseSlug = slugify(parsed.data.orgName);
  let slug = baseSlug;

  const { data: existing } = await service
    .from("tenants")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = withSuffix(baseSlug, Math.random().toString(36).slice(2, 7));
  }

  const { data: tenant, error: tenantError } = await service
    .from("tenants")
    .insert({
      name: parsed.data.orgName,
      slug,
      status: "active",
    })
    .select("id, name, slug")
    .single();

  if (tenantError || !tenant) {
    redirect(`/account/setup?error=${encodeURIComponent(tenantError?.message || "Failed to create organization.")}`);
  }

  const membershipResult = await service.from("memberships").insert({
    tenant_id: tenant.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (membershipResult.error) {
    await service.from("tenants").delete().eq("id", tenant.id);
    redirect(`/account/setup?error=${encodeURIComponent(membershipResult.error.message)}`);
  }

  const customerResult = await service.from("customers").insert({
    id: tenant.id,
    name: tenant.name,
    status: "active",
  });

  if (customerResult.error) {
    await service.from("tenants").delete().eq("id", tenant.id);
    redirect(`/account/setup?error=${encodeURIComponent(customerResult.error.message)}`);
  }

  await service.from("customer_profiles").insert({
    customer_id: tenant.id,
    org_type: parsed.data.orgType,
    legal_name: parsed.data.legalName,
    trade_name: parsed.data.tradeName,
    address_line1: parsed.data.addressLine1,
    address_line2: parsed.data.addressLine2,
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postalCode,
    country: parsed.data.country,
    phone: parsed.data.phone,
    website: parsed.data.website,
  });

  await service.from("audit_log").insert({
    tenant_id: tenant.id,
    actor_user_id: user.id,
    action: "customer.create",
    entity_type: "customer",
    entity_id: tenant.id,
    diff_json: {
      after: {
        name: tenant.name,
        slug: tenant.slug,
      },
    },
  });

  redirect("/account");
}
