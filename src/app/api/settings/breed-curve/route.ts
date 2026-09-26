// GET /api/settings/breed-curve — the breed standard; PATCH — replace its points (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { breedCurveSchema } from "@/schemas/weight";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { getBreedCurve, saveBreedCurve } from "@/server/services/breed-curve";

export const GET = route(async () => {
  await requireSession();
  return Response.json(await getBreedCurve(getDb()));
});

export const PATCH = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await saveBreedCurve(getDb(), breedCurveSchema.parse(await req.json()).points, user));
});
