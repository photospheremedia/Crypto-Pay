import { MarketingPageShell } from "@/components/cryptopay/marketing-section";
import { BRAND } from "@/lib/cryptopay/constants";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/legal/types";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  lastUpdatedLabel: string;
  children: React.ReactNode;
  footerNote: string;
  contactEmail?: string;
};

export function LegalPageShell({
  eyebrow,
  title,
  lastUpdatedLabel,
  children,
  footerNote,
  contactEmail = BRAND.email,
}: LegalPageShellProps) {
  return (
    <MarketingPageShell narrow>
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">{eyebrow}</p>
      <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm text-slate-600">{lastUpdatedLabel}</p>

      {children}

      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="mb-2 text-slate-700">
            <strong>{BRAND.name}</strong>
          </p>
          <p className="mb-2 text-slate-700">
            Email:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-emerald-500 hover:text-emerald-600"
            >
              {contactEmail}
            </a>
          </p>
          <p className="text-slate-700">Support: Available through your merchant dashboard</p>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">{footerNote}</p>
        <p className="mt-2 text-center text-sm text-slate-600">
          Effective date: {LEGAL_EFFECTIVE_DATE}
        </p>
      </div>
    </MarketingPageShell>
  );
}
