// Sign in with email and password; retries once when NextAuth reports a CSRF cookie race (first visit on a device)
import { signIn } from "next-auth/react";

export type SignInOutcome = { ok: true } | { ok: false; error: string };

async function attempt(email: string, password: string) {
  return signIn("credentials", { email, password, redirect: false });
}

// On a CSRF mismatch NextAuth still says ok, with a url back to its own sign-in page
const csrfRace = (url?: string | null) => Boolean(url?.includes("csrf=true"));

export async function signInWithPassword(email: string, password: string): Promise<SignInOutcome> {
  let res = await attempt(email, password);
  if (res && csrfRace(res.url)) res = await attempt(email, password);
  if (res?.ok && !res.error && !csrfRace(res.url)) return { ok: true };
  return { ok: false, error: res?.error ?? "CredentialsSignin" };
}
