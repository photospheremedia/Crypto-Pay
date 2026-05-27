import { AuthChromeLayout } from "@/components/auth/auth-chrome-layout";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthChromeLayout>{children}</AuthChromeLayout>;
}
