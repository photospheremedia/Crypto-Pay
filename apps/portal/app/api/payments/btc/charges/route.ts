import { NextResponse } from "next/server";
import {
  routeInternalError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { listUserPaymentCharges } from "@/lib/payments/btc-charges";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return routeUnauthorized();

    const charges = await listUserPaymentCharges(supabase, user.id);
    return NextResponse.json({ success: true, charges });
  } catch (error) {
    return routeInternalError(error, { logContext: "payments/btc/charges GET" });
  }
}
