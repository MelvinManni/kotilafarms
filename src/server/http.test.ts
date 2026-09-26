// The route wrapper turns every kind of failure into the right status and { error } body
import { describe, expect, it } from "vitest";
import * as z from "zod/mini";
import { forbidden, notFound, unauthorized } from "@/server/errors";
import { route } from "@/server/http";

const run = async (fail: () => never) => {
  const res = await route(async () => fail())(new Request("http://x"), {});
  return { status: res.status, body: await res.json() };
};

describe("route wrapper", () => {
  it("passes a good response through", async () => {
    const res = await route(async () => Response.json({ ok: true }, { status: 201 }))(new Request("http://x"), {});
    expect(res.status).toBe(201);
  });

  it("maps our errors", async () => {
    expect((await run(() => { throw unauthorized(); })).status).toBe(401);
    expect((await run(() => { throw forbidden(); })).status).toBe(403);
    const missing = await run(() => { throw notFound("Set 9"); });
    expect(missing).toEqual({ status: 404, body: { error: { code: "not_found", message: "Set 9 wasn't found." } } });
  });

  it("maps zod errors to 422 with the issues", async () => {
    const r = await run(() => { z.object({ amount: z.number({ error: "Enter an amount." }) }).parse({}); throw new Error("unreachable"); });
    expect(r.status).toBe(422);
    expect(r.body.error.issues).toEqual([{ path: "amount", message: "Enter an amount." }]);
  });

  it("maps Postgres unique and check violations", async () => {
    const pg = (code: string) => Object.assign(new Error("query failed"), { cause: { code, constraint: "expenses_set_or_overhead" } });
    expect((await run(() => { throw pg("23505"); })).status).toBe(409);
    const check = await run(() => { throw pg("23514"); });
    expect(check.status).toBe(422);
    expect(check.body.error.message).toContain("expenses_set_or_overhead");
  });

  it("hides unknown errors behind a 500", async () => {
    const original = console.error;
    console.error = () => {};
    const r = await run(() => { throw new Error("secret detail"); });
    console.error = original;
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain("secret detail");
  });
});
