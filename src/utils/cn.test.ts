// Tests that theme sizes survive next to colours
import { describe, expect, it } from "vitest";
import { cn } from "@/utils/cn";

describe("cn", () => {
  it("keeps a theme font size next to a text colour", () => {
    expect(cn("text-caption", "text-alert-ink")).toBe("text-caption text-alert-ink");
  });
  it("still lets a later size win", () => expect(cn("text-caption", "text-figure")).toBe("text-figure"));
  it("treats theme shadows as shadows", () => expect(cn("shadow-primary", "shadow-none")).toBe("shadow-none"));
});
