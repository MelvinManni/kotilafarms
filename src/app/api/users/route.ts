// GET /api/users — owners see everyone with access; POST adds a person with an emailed starting password
import { personCreateSchema } from "@/schemas/auth";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { addPerson } from "@/server/services/people";
import { listUsers } from "@/server/services/users";

export const GET = route(async () => {
  requireRole(await requireSession(), ["owner"]);
  return Response.json(await listUsers(getDb()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  return Response.json(await addPerson(getDb(), personCreateSchema.parse(await req.json()), user), { status: 201 });
});
