// Sign-in retries once on NextAuth's CSRF race and never reports that as success
import { beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn();
vi.mock("next-auth/react", () => ({ signIn: (...args: unknown[]) => signIn(...args) }));
const { signInWithPassword } = await import("@/lib/auth/sign-in-with-password");

const csrf = { ok: true, error: null, status: 200, url: "http://x/api/auth/signin?csrf=true" };
const good = { ok: true, error: null, status: 200, url: "http://x/" };

describe("signInWithPassword", () => {
  beforeEach(() => signIn.mockReset());
  it("retries once after a CSRF race", async () => {
    signIn.mockResolvedValueOnce(csrf).mockResolvedValueOnce(good);
    expect(await signInWithPassword("a@b.c", "pw")).toEqual({ ok: true });
    expect(signIn).toHaveBeenCalledTimes(2);
  });
  it("doesn't call a second race a success", async () => {
    signIn.mockResolvedValue(csrf);
    expect((await signInWithPassword("a@b.c", "pw")).ok).toBe(false);
  });
  it("passes wrong-password errors through", async () => {
    signIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401, url: null });
    expect(await signInWithPassword("a@b.c", "pw")).toEqual({ ok: false, error: "CredentialsSignin" });
  });
});
