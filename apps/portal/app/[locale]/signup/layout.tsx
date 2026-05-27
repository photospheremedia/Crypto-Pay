import { AuthChromeLayout } from "@/components/auth/auth-chrome-layout";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <AuthChromeLayout variant="marketing">{children}</AuthChromeLayout>;
}
