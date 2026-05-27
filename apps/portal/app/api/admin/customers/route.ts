import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// GET - List customers from multiple sources:
// 1. user_profiles (registered users who are NOT staff/admin)
// 2. chat_conversations with contact info (leads/guests)
// 3. orders shipping addresses (for guest orders)
export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const source = searchParams.get("source"); // "users", "leads", "all"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get staff/admin user IDs to exclude from customer list
    const { data: staffMembers } = await supabase
      .from("memberships")
      .select("user_id")
      .in("role", ["staff", "admin", "owner", "rhs_admin"]);
    
    const staffUserIds = staffMembers?.map(m => m.user_id) || [];

    // Build query for user_profiles (excluding staff/admins)
    let profilesQuery = supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Exclude staff/admin users
    if (staffUserIds.length > 0) {
      profilesQuery = profilesQuery.not("id", "in", `(${staffUserIds.join(",")})`);
    }

    if (search) {
      profilesQuery = profilesQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data: profiles, count: profileCount } = await profilesQuery
      .range(offset, offset + limit - 1);

    // Get leads from chat_conversations (guests with contact info)
    let leadsQuery = supabase
      .from("chat_conversations")
      .select("*", { count: "exact" })
      .eq("contact_captured", true)
      .order("created_at", { ascending: false });

    if (search) {
      leadsQuery = leadsQuery.or(`guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,guest_phone.ilike.%${search}%`);
    }

    const { data: leads, count: leadsCount } = await leadsQuery.limit(50);

    // Combine and deduplicate by email
    const emailSet = new Set<string>();
    const customers: any[] = [];

    // Add registered users first
    profiles?.forEach(p => {
      if (p.email) emailSet.add(p.email.toLowerCase());
      customers.push({
        id: p.id,
        name: p.full_name || p.company_name || p.email?.split("@")[0] || "Unknown",
        email: p.email,
        phone: p.phone,
        company_name: p.company_name,
        address: p.address_line1 ? {
          line1: p.address_line1,
          line2: p.address_line2,
          city: p.city,
          state: p.state,
          postal_code: p.postal_code,
          country: p.country,
        } : null,
        status: p.onboarding_completed ? "active" : "incomplete",
        source: "registered",
        created_at: p.created_at,
        updated_at: p.updated_at,
      });
    });

    // Add leads that aren't already registered
    leads?.forEach(l => {
      if (l.guest_email && !emailSet.has(l.guest_email.toLowerCase())) {
        emailSet.add(l.guest_email.toLowerCase());
        customers.push({
          id: l.id,
          name: l.guest_name || l.guest_email?.split("@")[0] || "Guest",
          email: l.guest_email,
          phone: l.guest_phone,
          company_name: null,
          address: null,
          status: "lead",
          source: "chat_lead",
          lead_status: l.lead_status,
          lead_score: l.lead_score,
          ip_address: l.ip_address,
          location: null, // We'd need IP geolocation service
          referrer: l.referrer,
          utm_source: l.utm_source,
          created_at: l.created_at || l.started_at,
          updated_at: l.updated_at,
        });
      }
    });

    // Get stats
    const { count: totalRegistered } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .not("id", "in", staffUserIds.length > 0 ? `(${staffUserIds.join(",")})` : "(null)");

    const { count: completedOnboarding } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("onboarding_completed", true)
      .not("id", "in", staffUserIds.length > 0 ? `(${staffUserIds.join(",")})` : "(null)");

    const { count: totalLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("contact_captured", true);

    // Legacy Restaurant Hub "orders" table has been removed from Crypto Pay.
    // Keep the field for API compatibility (0) unless/until we add a Crypto Pay-native equivalent.
    const uniqueOrderUsers = 0;

    // Get new this month
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    
    const { count: newThisMonth } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstOfMonth.toISOString())
      .not("id", "in", staffUserIds.length > 0 ? `(${staffUserIds.join(",")})` : "(null)");

    return NextResponse.json({
      success: true,
      customers: customers.slice(0, limit),
      stats: {
        total: (totalRegistered || 0) + (totalLeads || 0),
        registered: totalRegistered || 0,
        completedProfile: completedOnboarding || 0,
        leads: totalLeads || 0,
        withOrders: uniqueOrderUsers,
        newThisMonth: newThisMonth || 0,
      },
      pagination: {
        page,
        limit,
        total: customers.length,
        totalPages: Math.ceil(customers.length / limit),
      },
    });
  } catch (error) {
    console.error("[Customers] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new customer (user profile)
export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", body.email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const { data: customer, error } = await supabase
      .from("user_profiles")
      .insert({
        id: crypto.randomUUID(),
        email: body.email,
        full_name: body.name,
        phone: body.phone || null,
        company_name: body.company || null,
        business_type: body.business_type || null,
        address_line1: body.address?.line1 || null,
        address_line2: body.address?.line2 || null,
        city: body.address?.city || null,
        state: body.address?.state || null,
        postal_code: body.address?.postal_code || null,
        country: body.address?.country || null,
        onboarding_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[Customers] Create error:", error);
      return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("[Customers] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
