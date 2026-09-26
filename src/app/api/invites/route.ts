// POST /api/invites — an owner invites someone (or resets their password); returns the link to share
import { inviteCreateSchema } from "@/schemas/auth";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { createInvite } from "@/server/services/invites";

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const input = inviteCreateSchema.parse(await req.json());
  return Response.json(await createInvite(getDb(), input, user), { status: 201 });
});
