import { Suspense } from "react";
import { ResetPasswordForm } from "../(reset-password)/form";
import { PageLoading } from "@/components/ui/loading-indicator";

export const metadata = {
  title: "Reset Password | Crypto Pay",
  description: "Create a new password for your Crypto Pay account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoading message="verifying" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
