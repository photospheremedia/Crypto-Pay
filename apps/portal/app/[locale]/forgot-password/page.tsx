import { Suspense } from "react";
import { ForgotPasswordForm } from "../(forgot-password)/form";
import { PageLoading } from "@/components/ui/loading-indicator";

export const metadata = {
  title: "Forgot Password | Crypto Pay",
  description: "Reset your Crypto Pay account password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
