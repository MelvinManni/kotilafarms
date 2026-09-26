// Which nav item is active for a path
import { describe, expect, it } from "vitest";
import { activeNavId } from "@/constants/nav";

describe("activeNavId", () => {
  it("matches the section", () => expect(activeNavId("/sets/abc")).toBe("sets"));
  it("prefers the longer match", () => expect(activeNavId("/log/history")).toBe("history"));
  it("finds settings", () => expect(activeNavId("/settings/users")).toBe("settings"));
  it("is undefined elsewhere", () => expect(activeNavId("/dev/components")).toBeUndefined());
});
