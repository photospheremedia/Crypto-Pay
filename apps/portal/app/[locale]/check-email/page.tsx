import { Suspense } from "react";
import { CheckEmailScreen } from "./screen";
import { PageLoading } from "@/components/ui/loading-indicator";

export const metadata = {
  title: "Check your email | Crypto Pay",
  description: "Confirm your email to finish creating your Crypto Pay account.",
};

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<PageLoading message="loading" />}>
      <CheckEmailScreen />
    </Suspense>
  );
}

