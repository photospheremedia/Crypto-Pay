import { Fraunces } from "next/font/google";
import { CryptoPayHeader } from "@/components/cryptopay/crypto-pay-header";
import { CryptoPayFooter } from "@/components/cryptopay/crypto-pay-footer";
import { CartProvider } from "@/components/store/cart-context";
import { ScrollToTop } from "./components/scroll-to-top";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${display.variable} min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        <div className="pointer-events-none absolute -left-64 top-20 h-96 w-96 rounded-full bg-emerald-200/20 blur-[120px] dark:bg-emerald-900/20" />
        <div className="pointer-events-none absolute -right-64 top-60 h-96 w-96 rounded-full bg-cyan-200/20 blur-[120px] dark:bg-cyan-900/20" />

        <CartProvider>
          <CryptoPayHeader />
          <main
            id="main-content"
            className="relative z-10 [&>*:first-child]:!pt-10 sm:[&>*:first-child]:!pt-12 lg:[&>*:first-child]:!pt-14"
          >
            {children}
          </main>
        </CartProvider>
        <ScrollToTop />
        <CryptoPayFooter />
      </div>
    </div>
  );
}
