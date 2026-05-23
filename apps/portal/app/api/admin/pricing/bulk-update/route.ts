import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid updates format" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Update each product's price
    for (const update of updates) {
      const { sku, new_price } = update;

      if (!sku || new_price === undefined) {
        errors.push({ sku, error: "Missing sku or new_price" });
        continue;
      }

      const { error } = await supabase
        .from("products")
        .update({ price: new_price, updated_at: new Date().toISOString() })
        .eq("sku", sku);

      if (error) {
        errors.push({ sku, error: error.message });
      } else {
        results.push({ sku, success: true });
      }
    }

    return NextResponse.json({
      updated: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk price update error:", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
