import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// GET - List audit logs (permission-gated)
export async function GET(req: NextRequest) {
  try {
    const { user, permissions } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions?.canViewAuditLogs) {
      return NextResponse.json({ error: "Audit log access required" }, { status: 403 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resourceType");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq("action", action);
    if (resourceType) query = query.eq("resource_type", resourceType);
    if (userId) query = query.eq("user_id", userId);
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    const { data: logs, count, error } = await query;

    if (error) {
      console.error("[Audit Logs] Error:", error);
      return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }

    // Get unique action types for filters
    const { data: actionTypes } = await supabase
      .from("audit_logs")
      .select("action")
      .limit(100);
    
    const uniqueActions = [...new Set(actionTypes?.map((a) => a.action) || [])];

    // Get unique resource types for filters
    const { data: resourceTypes } = await supabase
      .from("audit_logs")
      .select("resource_type")
      .limit(100);
    
    const uniqueResourceTypes = [...new Set(resourceTypes?.map((r) => r.resource_type) || [])];

    return NextResponse.json({
      success: true,
      logs,
      permissions: {
        canViewAuditLogs: true,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        actions: uniqueActions,
        resourceTypes: uniqueResourceTypes,
      },
    });
  } catch (error) {
    console.error("[Audit Logs] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create audit log entry (for client-side events)
export async function POST(req: NextRequest) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();
    
    const { action, resourceType, resourceId, description, metadata } = body;

    if (!action || !resourceType) {
      return NextResponse.json({ error: "Action and resource type are required" }, { status: 400 });
    }

    // Get user info
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const { data: log, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: user.id,
        user_email: user.email,
        user_role: membership?.role,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        description,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("[Audit Logs] Create error:", error);
      return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("[Audit Logs] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
