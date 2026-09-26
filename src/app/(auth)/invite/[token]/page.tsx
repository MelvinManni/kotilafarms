// /invite/:token — set a password from an invite link
import type { Metadata } from "next";
import { AcceptInvite } from "@/components/auth/accept-invite";

export const metadata: Metadata = { title: "Accept invite · Kotila Farm" };

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  return <AcceptInvite token={token} />;
}
