import { NextResponse } from "next/server";
import {
  routeBadRequest,
  routeInternalError,
  routeUnauthorized,
} from "@/lib/api/route-error";
import { getUserPaymentCharge } from "@/lib/payments/btc-charges";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function routeNotFound(message = "Not found") {
  return NextResponse.json({ error: message, code: "not_found" }, { status: 404 });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) return routeBadRequest("Missing charge id");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return routeUnauthorized();

    const charge = await getUserPaymentCharge(supabase, user.id, id);
    if (!charge) return routeNotFound();

    return NextResponse.json({ success: true, charge });
  } catch (error) {
    return routeInternalError(error, { logContext: "payments/btc/charges/[id] GET" });
  }
}
