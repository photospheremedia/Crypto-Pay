import Link from "next/link";
import { Logo } from "@/components/logo";
import { mainBelowHeaderClass } from "@/lib/layout-spacing";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo size="md" showText={true} />
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          >
            ← Back to site
          </Link>
        </div>
      </header>
      <main className={mainBelowHeaderClass}>{children}</main>
    </div>
  );
}
