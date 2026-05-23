import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// Default settings
const DEFAULT_SETTINGS = {
  store: {
    name: "My Store",
    email: "",
    phone: "",
    address: {},
    logo_url: "",
    timezone: "America/New_York",
    currency: "USD",
    tax_rate: 0,
  },
  orders: {
    min_order_amount_cents: 0,
    delivery_fee_cents: 0,
    free_delivery_threshold_cents: null,
    accepts_cash: true,
    accepts_card: true,
  },
  notifications: {
    notify_new_order: true,
    notify_order_status: true,
    notify_low_stock: true,
    notify_new_customer: false,
    notify_email: "",
    notify_phone: "",
  },
  operating_hours: [],
  social_links: {},
};

// GET: Fetch settings from tenant_settings table (with fallback)
export async function GET() {
  try {
    const { user, isSuperAdmin } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get tenant
    const { data: membership } = await supabase
      .from("memberships")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();

    if (!membership?.tenant_id) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
      });
    }

    // Try new tenant_settings table first
    const { data: settings, error: settingsError } = await supabase
      .from("tenant_settings")
      .select("*")
      .eq("tenant_id", membership.tenant_id)
      .single();

    if (!settingsError && settings) {
      // New schema - use tenant_settings
      return NextResponse.json({
        success: true,
        settings: {
          store: {
            name: settings.store_name || DEFAULT_SETTINGS.store.name,
            email: settings.store_email || "",
            phone: settings.store_phone || "",
            address: settings.store_address || {},
            logo_url: settings.logo_url || "",
            timezone: settings.timezone || DEFAULT_SETTINGS.store.timezone,
            currency: settings.currency || DEFAULT_SETTINGS.store.currency,
            tax_rate: settings.tax_rate || 0,
          },
          orders: {
            min_order_amount_cents: settings.min_order_amount_cents || 0,
            delivery_fee_cents: settings.delivery_fee_cents || 0,
            free_delivery_threshold_cents: settings.free_delivery_threshold_cents,
            accepts_cash: settings.accepts_cash ?? true,
            accepts_card: settings.accepts_card ?? true,
          },
          notifications: {
            notify_new_order: settings.notify_new_order ?? true,
            notify_order_status: settings.notify_order_status ?? true,
            notify_low_stock: settings.notify_low_stock ?? true,
            notify_new_customer: settings.notify_new_customer ?? false,
            notify_email: settings.notify_email || "",
            notify_phone: settings.notify_phone || "",
          },
          operating_hours: settings.operating_hours || [],
          social_links: settings.social_links || {},
          seo: {
            meta_title: settings.meta_title || "",
            meta_description: settings.meta_description || "",
          },
        },
      });
    }

    // Fallback - get tenant name from tenants table
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", membership.tenant_id)
      .single();

    return NextResponse.json({
      success: true,
      settings: {
        ...DEFAULT_SETTINGS,
        store: {
          ...DEFAULT_SETTINGS.store,
          name: tenant?.name || DEFAULT_SETTINGS.store.name,
        },
      },
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT: Update settings using tenant_settings table
export async function PUT(req: NextRequest) {
  try {
    const { user, isSuperAdmin } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { store, orders, notifications, operating_hours, social_links, seo } = body;

    const supabase = await createClient();

    // Get tenant and check permissions
    const { data: membership } = await supabase
      .from("memberships")
      .select("tenant_id, role")
      .eq("user_id", user.id)
      .single();

    if (!membership?.tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 });
    }

    if (!["admin", "owner", "rhs_admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Prepare settings data
    const settingsData = {
      tenant_id: membership.tenant_id,
      store_name: store?.name,
      store_email: store?.email,
      store_phone: store?.phone,
      store_address: store?.address,
      logo_url: store?.logo_url,
      timezone: store?.timezone,
      currency: store?.currency,
      tax_rate: store?.tax_rate,
      min_order_amount_cents: orders?.min_order_amount_cents,
      delivery_fee_cents: orders?.delivery_fee_cents,
      free_delivery_threshold_cents: orders?.free_delivery_threshold_cents,
      accepts_cash: orders?.accepts_cash,
      accepts_card: orders?.accepts_card,
      notify_new_order: notifications?.notify_new_order,
      notify_order_status: notifications?.notify_order_status,
      notify_low_stock: notifications?.notify_low_stock,
      notify_new_customer: notifications?.notify_new_customer,
      notify_email: notifications?.notify_email,
      notify_phone: notifications?.notify_phone,
      operating_hours: operating_hours,
      social_links: social_links,
      meta_title: seo?.meta_title,
      meta_description: seo?.meta_description,
      updated_at: new Date().toISOString(),
    };

    // Try upsert to tenant_settings
    const { error: upsertError } = await supabase
      .from("tenant_settings")
      .upsert(settingsData, { 
        onConflict: "tenant_id",
        ignoreDuplicates: false 
      });

    if (upsertError) {
      // If table doesn't exist, update tenant name at least
      if (upsertError.code === "42P01") {
        const { error: tenantError } = await supabase
          .from("tenants")
          .update({ name: store?.name })
          .eq("id", membership.tenant_id);

        if (tenantError) {
          console.error("Tenant update error:", tenantError);
          return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true,
          message: "Updated tenant name. Run migration for full settings support."
        });
      }

      console.error("Settings upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
