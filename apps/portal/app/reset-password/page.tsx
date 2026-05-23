import { Suspense } from "react";
import { ResetPasswordForm } from "../(reset-password)/form";

export const metadata = {
  title: "Reset Password | Restaurant Hub Solution",
  description: "Create a new password for your Restaurant Hub Solution account",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
