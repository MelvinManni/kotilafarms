// Tests for "last active" wording
import { describe, expect, it } from "vitest";
import { lastActive } from "@/utils/format/last-active";

const now = new Date("2026-09-26T10:00:00Z");

describe("lastActive", () => {
  it("says today with the time", () => expect(lastActive("2026-09-26T07:12:00Z", now)).toBe("Today, 8:12am"));
  it("says yesterday", () => expect(lastActive("2026-09-25T15:00:00Z", now)).toBe("Yesterday"));
  it("gives the day for older", () => expect(lastActive("2026-09-24T17:40:00Z", now)).toBe("Thu 24 Sep"));
  it("says never", () => expect(lastActive(null, now)).toBe("Never"));
});
