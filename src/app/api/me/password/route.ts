// POST /api/me/password — change your own password (allowed while an app-made password must be changed)
import { passwordChangeSchema } from "@/schemas/auth";
import { getSessionUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { unauthorized } from "@/server/errors";
import { route } from "@/server/http";
import { changePassword } from "@/server/services/password";

export const POST = route(async (req) => {
  const user = await getSessionUser();
  if (!user) throw unauthorized();
  return Response.json(await changePassword(getDb(), user.id, passwordChangeSchema.parse(await req.json())));
});
