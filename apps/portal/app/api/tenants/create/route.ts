import { NextResponse } from "next/server";
import { CreateTenantInputSchema, slugify, withSuffix } from "@crypto-pay/shared";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@crypto-pay/db/supabaseServer";

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateTenantInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tenant name" }, { status: 400 });
  }

  const name = parsed.data.name.trim();
  const service = getSupabaseServiceClient();

  const baseSlug = slugify(name);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: existing } = await service
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) {
      break;
    }

    slug = withSuffix(baseSlug, randomSuffix());
  }

  const { data: collision } = await service
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (collision) {
    return NextResponse.json(
      { error: "Unable to generate a unique slug" },
      { status: 409 },
    );
  }

  const { data: tenant, error: tenantError } = await service
    .from("tenants")
    .insert({ name, slug })
    .select("id, slug")
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json(
      { error: tenantError?.message || "Failed to create tenant" },
      { status: 500 },
    );
  }

  const { error: customerError } = await service
    .from("customers")
    .insert({ id: tenant.id, name, status: "active" });

  if (customerError) {
    await service.from("tenants").delete().eq("id", tenant.id);
    return NextResponse.json(
      { error: customerError.message || "Failed to create customer" },
      { status: 500 },
    );
  }

  const { data: membership, error: membershipError } = await service
    .from("memberships")
    .insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: "owner",
      status: "active",
    })
    .select("id")
    .single();

  if (membershipError || !membership) {
    await service.from("tenants").delete().eq("id", tenant.id);
    return NextResponse.json(
      { error: membershipError?.message || "Failed to create membership" },
      { status: 500 },
    );
  }

  await service.from("audit_log").insert({
    tenant_id: tenant.id,
    actor_user_id: user.id,
    action: "tenant.created",
    entity_type: "tenant",
    entity_id: tenant.id,
    diff_json: { name, slug },
  });

  await service.from("audit_log").insert({
    tenant_id: tenant.id,
    actor_user_id: user.id,
    action: "membership.created",
    entity_type: "membership",
    entity_id: membership.id,
    diff_json: { role: "owner", status: "active" },
  });

  return NextResponse.json({ tenantId: tenant.id, slug: tenant.slug });
}
