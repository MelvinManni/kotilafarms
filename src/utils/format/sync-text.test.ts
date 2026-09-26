// Tests for sync status wording
import { describe, expect, it } from "vitest";
import { syncText } from "@/utils/format/sync-text";

describe("syncText", () => {
  it("says when it last synced", () => expect(syncText("synced", 0, "2 min ago")).toBe("All synced · 2 min ago"));
  it("counts waiting entries offline", () => expect(syncText("offline", 3)).toBe("Offline · 3 waiting"));
  it("uses singular and plural", () => {
    expect(syncText("syncing", 1)).toBe("Sending 1 entry…");
    expect(syncText("conflict", 2)).toBe("2 entries need a look");
    expect(syncText("conflict", 1)).toBe("1 entry needs a look");
  });
  it("names rejected entries", () => expect(syncText("rejected", 1)).toBe("1 entry couldn't be saved"));
});
