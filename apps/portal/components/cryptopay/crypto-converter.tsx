"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CRYPTO_OPTIONS,
  FIAT_CURRENCIES,
} from "@/lib/cryptopay/constants";
import { cn } from "@/lib/utils";

type Rates = Record<string, Record<string, number>>;

type CryptoConverterProps = {
  className?: string;
  compact?: boolean;
};

export function CryptoConverter({ className, compact }: CryptoConverterProps) {
  const [cryptoId, setCryptoId] = useState("bitcoin");
  const [fiat, setFiat] = useState("usd");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = CRYPTO_OPTIONS.map((c) => c.id).join(",");
      const vs = FIAT_CURRENCIES.map((f) => f.code).join(",");
      const res = await fetch(`/api/crypto-rates?ids=${ids}&vs=${vs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to load rates");
      setRates(json.rates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const numericAmount = parseFloat(amount) || 0;
  const price = rates?.[cryptoId]?.[fiat] ?? 0;
  const converted = numericAmount * price;

  const selectedCrypto = useMemo(
    () => CRYPTO_OPTIONS.find((c) => c.id === cryptoId) ?? CRYPTO_OPTIONS[0],
    [cryptoId],
  );

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: fiat.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(converted);

  const formattedUnit = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: fiat.toUpperCase(),
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-sm transition hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/80",
        compact ? "p-4" : "p-6 sm:p-8",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Live converter
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time crypto-to-fiat from market rates
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={fetchRates}
          disabled={loading}
          aria-label="Refresh rates"
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <div className="space-y-2">
          <Label htmlFor="crypto-amount">Amount</Label>
          <Input
            id="crypto-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crypto-select">Cryptocurrency</Label>
          <select
            id="crypto-select"
            value={cryptoId}
            onChange={(e) => setCryptoId(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {CRYPTO_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fiat-select">Local currency</Label>
          <select
            id="fiat-select"
            value={fiat}
            onChange={(e) => setFiat(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {FIAT_CURRENCIES.map((f) => (
              <option key={f.code} value={f.code}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-linear-to-r from-emerald-500/10 to-emerald-500/10 px-4 py-4 dark:from-emerald-500/15 dark:to-emerald-500/15">
        <ArrowLeftRight className="h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : loading && !rates ? (
            <p className="text-sm text-slate-500">Loading live rates…</p>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {formatted}
              </p>
              <p className="mt-1 truncate text-sm text-slate-500">
                {numericAmount || 0} {selectedCrypto.symbol} · 1 {selectedCrypto.symbol} ={" "}
                {formattedUnit}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
