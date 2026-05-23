import { CryptoPayLogo } from "@/components/cryptopay/crypto-pay-logo";

/** App-wide logo — Crypto Pay (replaces Crypto Pay). */
export function Logo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  return <CryptoPayLogo showTagline={showText && size !== "sm"} />;
}
