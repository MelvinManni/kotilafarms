// /profile — your details, password change and sign out (?first=1 after signing in with an app-made password)
import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata: Metadata = { title: "Your profile · Kotila Farm" };

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const { first } = await searchParams;
  return <ProfileScreen first={first === "1"} />;
}
