// /sign-in
import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInScreen } from "@/components/auth/sign-in-screen";

export const metadata: Metadata = { title: "Sign in · Kotila Farm" };

export default function SignInPage() {
  return (
    <Suspense>
      <SignInScreen />
    </Suspense>
  );
}
