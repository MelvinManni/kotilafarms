// Activity log: changes and sign-ins merged newest first, named records, filters, paging, owners only
import { describe, expect, it } from "vitest";
import { GET as activity } from "@/app/api/activity/route";
import { auditEvents, authEvents, shareholders } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makePerson } from "@test/db/people";

describe("activity API", () => {
  it("merges changes and sign-ins, names records, and filters", async () => {
    await withApi(async (tx) => {
      const owner = await makePerson(tx, "owner", "Kosi");
      const recorder = await makePerson(tx, "recorder", "Chinedu");
      const [nonso] = await tx.insert(shareholders).values({ clientId: crypto.randomUUID(), createdBy: owner.id, name: "Nonso", shares: 1 }).returning();
      await tx.insert(authEvents).values({ kind: "sign_in", email: recorder.email, userId: recorder.id, at: new Date("2026-09-26T08:00:00Z") });
      await tx.insert(auditEvents).values({ table: "shareholders", rowId: nonso!.id, action: "update", field: "removedAt", newValue: "2026-09-26", reason: "Left", userId: owner.id, at: new Date("2026-09-26T09:00:00Z") });
      await tx.insert(authEvents).values({ kind: "sign_in_failed", email: "stranger@example.com", at: new Date("2026-09-26T10:00:00Z") });
      signInAs(owner);

      const all = await call(activity);
      expect(all.status).toBe(200);
      expect(all.body.items.map((i: { text: string }) => i.text)).toEqual(["Someone tried to sign in as stranger@example.com", "removed Nonso from the share register", "signed in"]);
      expect(all.body.items[1]).toMatchObject({ who: "Kosi", reason: "Left" });
      expect(all.body.nextBefore).toBeNull();

      const byPerson = await call(activity, { query: `?person=${recorder.id}` });
      expect(byPerson.body.items).toHaveLength(1);
      const money = await call(activity, { query: "?kind=money" });
      expect(money.body.items.map((i: { who: string }) => i.who)).toEqual(["Kosi"]);
      const day = await call(activity, { query: "?from=2026-09-27" });
      expect(day.body.items).toHaveLength(0);
    });
  });

  it("pages through rows written in the same moment without losing any", async () => {
    await withApi(async (tx) => {
      const owner = await makePerson(tx, "owner");
      const at = new Date("2026-09-26T12:00:00Z");
      const rowId = crypto.randomUUID();
      await tx.insert(auditEvents).values(Array.from({ length: 60 }, () => ({ table: "sets", rowId, action: "update" as const, field: "status", userId: owner.id, at })));
      signInAs(owner);
      const first = await call(activity);
      expect(first.body.items).toHaveLength(50);
      const second = await call(activity, { query: `?before=${encodeURIComponent(first.body.nextBefore)}` });
      expect(second.body.items).toHaveLength(10);
      expect(new Set([...first.body.items, ...second.body.items].map((i: { id: string }) => i.id)).size).toBe(60);
    });
  });

  it("is for owners only", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "manager"));
      expect((await call(activity)).status).toBe(403);
    });
  });
});
