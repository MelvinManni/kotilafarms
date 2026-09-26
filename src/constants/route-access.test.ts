// Page access by role
import { describe, expect, it } from "vitest";
import { canOpenPath, isPublicPath } from "@/constants/route-access";

describe("route access", () => {
  it("keeps sign-in and invites public", () => {
    expect(isPublicPath("/sign-in")).toBe(true);
    expect(isPublicPath("/invite/abc")).toBe(true);
    expect(isPublicPath("/today")).toBe(false);
  });
  it("sends recorders away from money pages", () => {
    expect(canOpenPath("/log/set-4/2026-09-26", "recorder")).toBe(true);
    expect(canOpenPath("/sales", "recorder")).toBe(false);
    expect(canOpenPath("/finance", "manager")).toBe(true);
  });
  it("keeps capital and users for owners", () => {
    expect(canOpenPath("/finance/capital", "manager")).toBe(false);
    expect(canOpenPath("/settings/users", "manager")).toBe(false);
    expect(canOpenPath("/settings/users", "owner")).toBe(true);
    expect(canOpenPath("/settings/feed-types", "manager")).toBe(true);
  });
});
