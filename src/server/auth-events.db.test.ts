// Sign-in events find the person by email, keep unknown emails with no person, and never throw
import { describe, expect, it } from "vitest";
import { authEvents } from "@/db/schema";
import { recordAuthEvent } from "@/server/auth-events";
import { makePerson } from "@test/db/people";
import { inRollback } from "@test/db/test-db";

describe("auth events", () => {
  it("links a known email to the person and keeps an unknown one without", async () => {
    await inRollback(async (tx) => {
      const me = await makePerson(tx, "manager");
      await recordAuthEvent(tx, { kind: "sign_in_failed", email: me.email.toUpperCase(), ip: "1.2.3.4" });
      await recordAuthEvent(tx, { kind: "sign_in_failed", email: "nobody@example.com" });
      const rows = await tx.select().from(authEvents);
      expect(rows.find((r) => r.email === me.email.toLowerCase())).toMatchObject({ userId: me.id, ip: "1.2.3.4" });
      expect(rows.find((r) => r.email === "nobody@example.com")).toMatchObject({ userId: null });
    });
  });
});
