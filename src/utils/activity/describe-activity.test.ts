// Activity lines read as plain sentences
import { describe, expect, it } from "vitest";
import { describeActivity } from "@/utils/activity/describe-activity";

const audit = (over: Partial<{ action: "create" | "update" | "delete" | "resolve"; table: string; field: string | null; oldValue: unknown; newValue: unknown }>) => ({
  source: "audit" as const,
  action: "update" as const,
  table: "daily_logs",
  field: null,
  oldValue: null,
  newValue: null,
  ...over,
});

describe("describeActivity", () => {
  it("says what changed, from what to what", () => {
    expect(describeActivity(audit({ field: "deaths", oldValue: 2, newValue: 3 }), "Set 4's log for 26 Sep")).toBe("changed deaths on Set 4's log for 26 Sep from 2 to 3");
    expect(describeActivity(audit({ table: "expenses", field: "amount", oldValue: 12000, newValue: 15000 }))).toBe("changed amount on an expense from ₦12,000 to ₦15,000");
  });

  it("covers adds, removals, clashes, ids, passwords and the share register", () => {
    expect(describeActivity(audit({ action: "create", table: "sales" }), "a sale of 50 birds to Alhaji Sule")).toBe("added a sale of 50 birds to Alhaji Sule");
    expect(describeActivity(audit({ field: "deletedAt", newValue: "2026-09-26" }))).toBe("removed a daily log");
    expect(describeActivity(audit({ action: "resolve" }))).toBe("settled a clash on a daily log");
    expect(describeActivity(audit({ table: "expenses", field: "categoryId", oldValue: "a", newValue: "b" }))).toBe("changed the category on an expense");
    expect(describeActivity(audit({ table: "users", field: "password" }), "Chinedu's account")).toBe("reset the password for Chinedu's account");
    expect(describeActivity(audit({ table: "shareholders", field: "removedAt", newValue: "2026-09-29" }), "Nonso")).toBe("removed Nonso from the share register");
    expect(describeActivity(audit({ table: "shareholders", field: "removedAt", oldValue: "x", newValue: null }), "Nonso")).toBe("restored Nonso to the share register");
  });

  it("describes sign-ins, including unknown emails", () => {
    expect(describeActivity({ source: "auth", kind: "sign_in", email: "k@example.com", known: true })).toBe("signed in");
    expect(describeActivity({ source: "auth", kind: "sign_in_failed", email: "x@example.com", known: false })).toBe("Someone tried to sign in as x@example.com");
  });
});
