"use client";
// Sign-in page body: offline carry-on when there's no signal and someone was here before, otherwise the form
import { OfflineSignIn } from "@/components/auth/offline-sign-in";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useOnline } from "@/hooks/use-online";
import { useRememberedUser } from "@/hooks/use-remembered-user";

export function SignInScreen() {
  const online = useOnline();
  const user = useRememberedUser();
  return !online && user ? <OfflineSignIn user={user} /> : <SignInForm />;
}
