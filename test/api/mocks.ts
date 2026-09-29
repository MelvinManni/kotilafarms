// db project setup: routes read the test transaction and the test's signed-in person
import { vi } from "vitest";
import { apiState } from "@test/api/state";

vi.mock("@/server/db", () => ({
  getDb: () => {
    if (!apiState.tx) throw new Error("Route test ran outside withApi()");
    return apiState.tx;
  },
}));

vi.mock("@/server/farm-today", () => ({ farmToday: () => apiState.today }));

vi.mock("@/server/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/server/auth")>();
  const { unauthorized } = await import("@/server/errors");
  const { passwordGate } = await import("@/server/password-gate");
  return {
    ...original,
    getSessionUser: async () => apiState.user,
    requireSession: async () => {
      if (!apiState.user) throw unauthorized();
      return passwordGate(apiState.user);
    },
  };
});
