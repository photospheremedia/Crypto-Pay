import { NextResponse } from "next/server";
import { resolveTenantContext } from "@/lib/tenant-context";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("tenant");

  if (!slug) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const context = await resolveTenantContext(slug);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    tenantId: context.tenant.id,
    name: context.tenant.name,
    slug: context.tenant.slug,
  });
}
