import { NextResponse } from "next/server";
import { CRYPTO_OPTIONS, FIAT_CURRENCIES } from "@/lib/cryptopay/constants";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids") || CRYPTO_OPTIONS.map((c) => c.id).join(",");
  const vs = searchParams.get("vs") || FIAT_CURRENCIES.map((f) => f.code).join(",");

  try {
    const res = await fetch(
      `${COINGECKO_URL}?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Rate provider unavailable" },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ rates: data, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
