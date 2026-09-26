// Invites end to end through the API: owner invites, person accepts, can sign in; misuse is refused
import { describe, expect, it } from "vitest";
import { POST as acceptRoute } from "@/app/api/invites/accept/route";
import { POST as inviteRoute } from "@/app/api/invites/route";
import { checkCredentials } from "@/server/services/sign-in";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makePerson } from "@test/db/people";

const tokenOf = (path: string) => path.split("/").pop()!;

describe("invites API", () => {
  it("lets an owner invite a manager who then signs in", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner", "Emeka"));
      const invite = await call(inviteRoute, { method: "POST", body: { name: "Adaeze Nwankwo", email: "Adaeze@Example.com", role: "manager" } });
      expect(invite.status).toBe(201);
      expect(invite.body.isReset).toBe(false);
      signInAs(null);
      const token = tokenOf(invite.body.path);
      const accepted = await call(acceptRoute, { method: "POST", body: { token, password: "broilers2026", confirm: "broilers2026" } });
      expect(accepted).toEqual({ status: 200, body: { email: "adaeze@example.com" } });
      const person = await checkCredentials(tx, "ADAEZE@example.com", "broilers2026");
      expect(person).toMatchObject({ name: "Adaeze Nwankwo", role: "manager" });
      const again = await call(acceptRoute, { method: "POST", body: { token, password: "broilers2026", confirm: "broilers2026" } });
      expect(again.status).toBe(404);
    });
  });

  it("refuses non-owners and signed-out callers", async () => {
    await withApi(async (tx) => {
      const body = { name: "X", email: "x@example.com", role: "recorder" };
      expect((await call(inviteRoute, { method: "POST", body })).status).toBe(401);
      signInAs(await makePerson(tx, "manager"));
      expect((await call(inviteRoute, { method: "POST", body })).status).toBe(403);
    });
  });

  it("checks the password pair and length", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner"));
      const invite = await call(inviteRoute, { method: "POST", body: { name: "Chinedu", email: "chinedu@example.com", role: "recorder" } });
      const token = tokenOf(invite.body.path);
      const short = await call(acceptRoute, { method: "POST", body: { token, password: "short", confirm: "short" } });
      expect(short.status).toBe(422);
      expect(short.body.error.message).toBe("Use at least 10 characters.");
      const mismatch = await call(acceptRoute, { method: "POST", body: { token, password: "long-enough-1", confirm: "long-enough-2" } });
      expect(mismatch.body.error.issues[0]).toEqual({ path: "confirm", message: "The two passwords don't match." });
    });
  });

  it("resets the password of someone who already has an account", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner"));
      const recorder = await makePerson(tx, "recorder", "Chinedu Okafor");
      const invite = await call(inviteRoute, { method: "POST", body: { name: "Chinedu Okafor", email: recorder.email, role: "recorder" } });
      expect(invite.body.isReset).toBe(true);
      await call(acceptRoute, { method: "POST", body: { token: tokenOf(invite.body.path), password: "new-password-1", confirm: "new-password-1" } });
      expect(await checkCredentials(tx, recorder.email, "new-password-1")).toMatchObject({ id: recorder.id });
    });
  });
});
