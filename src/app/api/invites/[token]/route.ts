// GET /api/invites/:token — public: who sent this invite, for which role (404 when used or expired)
import { getDb } from "@/server/db";
import { notFound } from "@/server/errors";
import { route } from "@/server/http";
import { describeInvite } from "@/server/services/invites";

export const GET = route<RouteContext<"/api/invites/[token]">>(async (_req, ctx) => {
  const { token } = await ctx.params;
  const invite = await describeInvite(getDb(), token);
  if (!invite) throw notFound("That invite");
  return Response.json(invite);
});
