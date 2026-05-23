import { Suspense } from "react";
import { Login } from "../(login)/login";

export default function LoginPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
