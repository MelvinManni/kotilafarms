// GET /api/sets/:id/weights — samples with stats and the breed standard; POST — save a sample
import { weightSampleCreateSchema } from "@/schemas/weight";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { createWeightSample, listWeights } from "@/server/services/weights";

export const GET = route<RouteContext<"/api/sets/[id]/weights">>(async (_req, ctx) => {
  await requireSession();
  return Response.json(await listWeights(getDb(), (await ctx.params).id));
});

export const POST = route<RouteContext<"/api/sets/[id]/weights">>(async (req, ctx) => {
  const user = await requireSession();
  const { id } = await ctx.params;
  const { sample, created } = await createWeightSample(getDb(), id, weightSampleCreateSchema.parse(await req.json()), user, farmToday());
  return Response.json({ id: sample.id, possibleDuplicateOf: sample.possibleDuplicateOf }, { status: created ? 201 : 200 });
});
