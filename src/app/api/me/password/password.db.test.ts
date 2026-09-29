// Changing your own password: checks the current one, lifts the first-password gate, records the event
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST as changeRoute } from "@/app/api/me/password/route";
import { GET as setsRoute } from "@/app/api/sets/route";
import { authEvents, users } from "@/db/schema";
import { hashPassword } from "@/server/password";
import { checkCredentials } from "@/server/services/sign-in";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makePerson } from "@test/db/people";

describe("password change API", () => {
  it("changes the password, lifts the gate and records it", async () => {
    await withApi(async (tx) => {
      const me = await makePerson(tx, "recorder", "Chinedu");
      await tx.update(users).set({ passwordHash: await hashPassword("App-made-pass-1"), mustChangePassword: true }).where(eq(users.id, me.id));
      signInAs({ ...me, mustChangePassword: true });
      const blocked = await call(setsRoute);
      expect(blocked.status).toBe(403);
      expect(blocked.body.error.code).toBe("password_change_required");
      const res = await call(changeRoute, { method: "POST", body: { current: "App-made-pass-1", password: "my-own-password", confirm: "my-own-password" } });
      expect(res).toEqual({ status: 200, body: { ok: true } });
      expect(await checkCredentials(tx, me.email, "my-own-password")).toMatchObject({ id: me.id, mustChangePassword: false });
      const events = await tx.select().from(authEvents).where(eq(authEvents.userId, me.id));
      expect(events.map((e) => e.kind)).toContain("password_changed");
    });
  });

  it("refuses a wrong current password, a mismatch and the same password", async () => {
    await withApi(async (tx) => {
      const me = await makePerson(tx, "owner");
      await tx.update(users).set({ passwordHash: await hashPassword("current-pass-1") }).where(eq(users.id, me.id));
      signInAs(me);
      const wrong = await call(changeRoute, { method: "POST", body: { current: "not-it-at-all", password: "new-password-1", confirm: "new-password-1" } });
      expect(wrong.status).toBe(422);
      expect(wrong.body.error.issues[0]).toEqual({ path: "current", message: "That isn't your current password." });
      const mismatch = await call(changeRoute, { method: "POST", body: { current: "current-pass-1", password: "new-password-1", confirm: "new-password-2" } });
      expect(mismatch.body.error.issues[0].path).toBe("confirm");
      const same = await call(changeRoute, { method: "POST", body: { current: "current-pass-1", password: "current-pass-1", confirm: "current-pass-1" } });
      expect(same.body.error.issues[0]).toEqual({ path: "password", message: "Choose a password different from the current one." });
    });
  });

  it("needs someone signed in", async () => {
    await withApi(async () => {
      const res = await call(changeRoute, { method: "POST", body: { current: "a", password: "new-password-1", confirm: "new-password-1" } });
      expect(res.status).toBe(401);
    });
  });
});
