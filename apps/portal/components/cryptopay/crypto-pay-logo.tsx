import { Link } from "@/i18n/navigation";
import { Bitcoin } from "lucide-react";
import { BRAND } from "@/lib/cryptopay/constants";

export function CryptoPayLogo({
  showTagline = false,
  href = "/",
}: {
  showTagline?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 transition hover:opacity-90">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/25">
        <Bitcoin className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {BRAND.name}
        </p>
        {showTagline && (
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            Crypto payments
          </p>
        )}
      </div>
    </Link>
  );
}
