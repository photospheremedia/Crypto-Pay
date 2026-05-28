import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { routeInternalError, routeUnauthorized } from "@/lib/api/route-error";
import { createClient } from "@/lib/supabase/server";
import { sendPhoneVerificationOtp } from "@/lib/sms/phone-verification";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z.string().min(7).max(20),
  optIn: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return routeUnauthorized();

    const body = await parseRequestJson(req);
    if (body instanceof Response) return body;

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await sendPhoneVerificationOtp({
      userId: user.id,
      phone: parsed.data.phone,
      optIn: parsed.data.optIn,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, phoneE164: result.e164 });
  } catch (error) {
    return routeInternalError(error, { logContext: "account/sms/verify/send POST" });
  }
}
