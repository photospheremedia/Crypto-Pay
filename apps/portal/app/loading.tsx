import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-600 font-medium">{t("loading")}</p>
      </div>
    </div>
  );
}
