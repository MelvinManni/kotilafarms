// POST /api/users/:id/password — an owner resets someone's password; the app makes a new one and emails it
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { resetPassword } from "@/server/services/people";

export const POST = route<RouteContext<"/api/users/[id]/password">>(async (_req, ctx) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const { id } = await ctx.params;
  return Response.json(await resetPassword(getDb(), id, user));
});
