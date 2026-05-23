import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-4 gap-2 min-w-0">
          <Link href="/" className="hover:opacity-80 transition">
            <Logo size="md" showText={true} />
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
