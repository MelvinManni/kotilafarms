// POST /api/invites/accept — public: set a password from an invite link
import { inviteAcceptSchema } from "@/schemas/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { acceptInvite } from "@/server/services/invites";

export const POST = route(async (req) => {
  const input = inviteAcceptSchema.parse(await req.json());
  return Response.json(await acceptInvite(getDb(), input));
});
