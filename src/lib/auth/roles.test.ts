// Who can see and do what
import { describe, expect, it } from "vitest";
import { can } from "@/lib/auth/roles";

describe("can", () => {
  it("keeps money from recorders", () => {
    expect(can.seeMoney("recorder")).toBe(false);
    expect(can.seeMoney("manager")).toBe(true);
  });
  it("keeps capital, loans and users for owners", () => {
    expect(can.seeCapitalAndLoans("manager")).toBe(false);
    expect(can.manageUsers("owner")).toBe(true);
  });
  it("lets everyone log the day", () => expect(can.logDaily("recorder")).toBe(true));
});
