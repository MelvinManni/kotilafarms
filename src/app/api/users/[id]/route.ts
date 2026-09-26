// PATCH /api/users/:id — an owner changes someone's role or deactivates/reactivates them
import { userUpdateSchema } from "@/schemas/auth";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { updateUser } from "@/server/services/users";

export const PATCH = route<RouteContext<"/api/users/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const { id } = await ctx.params;
  const input = userUpdateSchema.parse(await req.json());
  return Response.json(await updateUser(getDb(), id, input, user));
});
