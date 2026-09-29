// Adding a person and resetting a password: app-made password, must be changed, emailed (or shown when email fails)
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as resetRoute } from "@/app/api/users/[id]/password/route";
import { POST as addRoute } from "@/app/api/users/route";
import { auditEvents, users } from "@/db/schema";
import { sendMail } from "@/server/mail/send-mail";
import { checkCredentials } from "@/server/services/sign-in";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makePerson } from "@test/db/people";

vi.mock("@/server/mail/send-mail", () => ({ sendMail: vi.fn() }));
const mailed = vi.mocked(sendMail);

beforeEach(() => {
  mailed.mockReset();
  mailed.mockResolvedValue({ sent: true });
});

const passwordIn = (text: string) => /Password: (\S+)/.exec(text)![1]!;

describe("adding people", () => {
  it("makes the account, emails the password and gates it", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner", "Kosi"));
      const res = await call(addRoute, { method: "POST", body: { name: "Chinedu Okafor", email: "Chinedu@Example.com", role: "recorder" } });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ emailed: true, password: null, person: { name: "Chinedu Okafor", email: "chinedu@example.com", role: "recorder" } });
      const mail = mailed.mock.calls[0]![0];
      expect(mail.to).toEqual(["chinedu@example.com"]);
      expect(mail.text).toContain("how-to");
      const person = await checkCredentials(tx, "chinedu@example.com", passwordIn(mail.text));
      expect(person).toMatchObject({ role: "recorder", mustChangePassword: true });
    });
  });

  it("shows the password once when the email can't go", async () => {
    await withApi(async (tx) => {
      mailed.mockResolvedValue({ sent: false, reason: "RESEND_API_KEY is not set" });
      signInAs(await makePerson(tx, "owner"));
      const res = await call(addRoute, { method: "POST", body: { name: "Ada", email: "ada@example.com", role: "manager" } });
      expect(res.body).toMatchObject({ emailed: false, emailProblem: "RESEND_API_KEY is not set" });
      expect(await checkCredentials(tx, "ada@example.com", res.body.password)).toMatchObject({ role: "manager" });
    });
  });

  it("refuses a used email and non-owners", async () => {
    await withApi(async (tx) => {
      const manager = await makePerson(tx, "manager", "Adaeze");
      signInAs(manager);
      expect((await call(addRoute, { method: "POST", body: { name: "X", email: "x@example.com", role: "recorder" } })).status).toBe(403);
      signInAs(await makePerson(tx, "owner"));
      const taken = await call(addRoute, { method: "POST", body: { name: "Again", email: manager.email.toUpperCase(), role: "recorder" } });
      expect(taken.status).toBe(409);
      expect(taken.body.error.message).toContain("Adaeze already has an account");
    });
  });
});

describe("resetting a password", () => {
  it("makes a new password, gates the account and audits it", async () => {
    await withApi(async (tx) => {
      signInAs(await makePerson(tx, "owner"));
      const recorder = await makePerson(tx, "recorder");
      const res = await call(resetRoute, { method: "POST", params: { id: recorder.id } });
      expect(res.status).toBe(200);
      const mail = mailed.mock.calls[0]![0];
      expect(mail.subject).toBe("Your new Kotila Farms password");
      expect(await checkCredentials(tx, recorder.email, passwordIn(mail.text))).toMatchObject({ mustChangePassword: true });
      const audit = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, recorder.id));
      expect(audit[0]).toMatchObject({ field: "password", action: "update" });
    });
  });

  it("won't reset your own or a deactivated person's password", async () => {
    await withApi(async (tx) => {
      const owner = await makePerson(tx, "owner");
      signInAs(owner);
      expect((await call(resetRoute, { method: "POST", params: { id: owner.id } })).status).toBe(422);
      const gone = await makePerson(tx, "recorder");
      await tx.update(users).set({ active: false }).where(eq(users.id, gone.id));
      expect((await call(resetRoute, { method: "POST", params: { id: gone.id } })).status).toBe(404);
    });
  });
});
