import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  { id: "TX-8F2A", asset: "BTC", amount: "0.0142", fiat: "$1,240.00", status: "confirmed" },
  { id: "TX-9C11", asset: "ETH", amount: "0.82", fiat: "$2,105.40", status: "confirmed" },
  { id: "TX-7B03", asset: "USDT", amount: "450", fiat: "$450.00", status: "pending" },
  { id: "TX-6A88", asset: "LTC", amount: "12.5", fiat: "$892.10", status: "confirmed" },
];

export function DashboardMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 shadow-2xl dark:border-slate-700",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-700/80 bg-slate-800/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/90" />
        <span className="h-3 w-3 rounded-full bg-amber-400/90" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        <span className="ml-2 text-xs text-slate-400">CryptivaPay Dashboard</span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
        <div className="rounded-xl bg-slate-800/80 p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Wallet className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Balance</span>
          </div>
          <p className="mt-2 text-2xl font-bold">$24,687.50</p>
          <p className="text-xs text-emerald-400">+12.4% this month</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-wider text-slate-400">Recent activity</p>
          <ul className="mt-3 space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/60 px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {tx.status === "confirmed" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                  )}
                  <span className="truncate font-mono text-xs text-slate-400">{tx.id}</span>
                  <span className="font-medium">{tx.asset}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">{tx.fiat}</p>
                  <p className="text-xs text-slate-500">
                    {tx.amount} {tx.asset}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-slate-700/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
          28 received
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpRight className="h-4 w-4 text-cyan-400" />
          4 pending
        </div>
      </div>
    </div>
  );
}
