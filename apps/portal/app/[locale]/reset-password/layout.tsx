import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-slate-50 text-slate-900">
      <header className="sticky left-0 right-0 top-0 z-30 bg-white/95 backdrop-blur-md border-b border-white/70 shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-4 min-w-0">
          <Logo size="md" showText={true} />
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/login" className="hover:text-emerald-500 transition">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-emerald-500 transition">
              Sign up
            </Link>
            <Link href="/contact" className="hover:text-emerald-500 transition">
              Contact
            </Link>
          </nav>
          
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to sign in</span>
          </Link>
        </div>
      </header>
      <main className="pt-8">{children}</main>
    </div>
  );
}
