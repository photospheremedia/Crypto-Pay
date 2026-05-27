import { Suspense } from "react";
import { SignupWizard } from "./signup-wizard";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupWizard />
    </Suspense>
  );
}
