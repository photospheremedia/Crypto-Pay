import { Suspense } from "react";
import { SignupForm } from "../(login)/signup-form";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
