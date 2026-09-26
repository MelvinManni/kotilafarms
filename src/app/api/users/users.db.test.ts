// Users API: owners change roles and deactivate; the farm always keeps an owner; changes are audited
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/users/[id]/route";
import { GET } from "@/app/api/users/route";
import { auditEvents } from "@/db/schema";
import { checkCredentials } from "@/server/services/sign-in";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makePerson } from "@test/db/people";

describe("users API", () => {
  it("lists people for owners only", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "recorder"));
      expect((await call(GET)).status).toBe(403);
      signInAs(await makePerson(tx, "owner"));
      const list = await call(GET);
      expect(list.status).toBe(200);
      expect(list.body).toHaveLength(2);
    });
  });

  it("changes a role and audits it", async () => {
    await withApi(async (tx) => {
      const owner = await makePerson(tx, "owner");
      const recorder = await makePerson(tx, "recorder");
      signInAs(owner);
      const res = await call(PATCH, { method: "PATCH", params: { id: recorder.id }, body: { role: "manager" } });
      expect(res.body.role).toBe("manager");
      const [audit] = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, recorder.id));
      expect(audit).toMatchObject({ field: "role", oldValue: "recorder", newValue: "manager", userId: owner.id });
    });
  });

  it("stops a deactivated person signing in", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner"));
      const recorder = await makePerson(tx, "recorder");
      await call(PATCH, { method: "PATCH", params: { id: recorder.id }, body: { active: false } });
      expect(await checkCredentials(tx, recorder.email, "anything")).toBeNull();
    });
  });

  it("never leaves the farm without an owner, and you can't deactivate yourself", async () => {
    await withApi(async (tx) => {
      const owner = await makePerson(tx, "owner");
      signInAs(owner);
      const self = await call(PATCH, { method: "PATCH", params: { id: owner.id }, body: { active: false } });
      expect(self.body.error.message).toBe("You can't deactivate yourself.");
      const demote = await call(PATCH, { method: "PATCH", params: { id: owner.id }, body: { role: "manager" } });
      expect(demote.body.error.message).toBe("The farm needs at least one active owner.");
    });
  });
});
