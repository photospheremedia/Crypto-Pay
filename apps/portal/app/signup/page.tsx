import { Suspense } from "react";
import { Login } from "../(login)/login";

export default function SignupPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
