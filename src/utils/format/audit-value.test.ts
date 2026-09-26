// Tests for edit history wording
import { describe, expect, it } from "vitest";
import { auditFieldLabel, auditValue } from "@/utils/format/audit-value";

describe("audit wording", () => {
  it("names fields plainly", () => expect(auditFieldLabel("feedQty")).toBe("feed used"));
  it("shows tags as words", () => expect(auditValue("tags", ["wet_litter", "coughing"])).toBe("Wet litter, Coughing"));
  it("says nothing for empty", () => expect(auditValue("note", null)).toBe("nothing"));
});
