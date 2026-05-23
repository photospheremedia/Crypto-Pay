import { Suspense } from "react";
import { ForgotPasswordForm } from "../(forgot-password)/form";

export const metadata = {
  title: "Forgot Password | Crypto Pay",
  description: "Reset your Crypto Pay account password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
