// Shared e2e steps
import { expect, type Page } from "@playwright/test";
import { E2E } from "./e2e-env";

// Open /sign-in and wait until the form is live (the button enables once the page has hydrated)
export async function openSignIn(page: Page) {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
}

export async function signIn(page: Page, email = E2E.owner.email, password = E2E.owner.password) {
  await openSignIn(page);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/today/);
}

// Start a Set through the API as whoever is signed in on this page; returns its id
export async function startSetViaApi(page: Page, over: Record<string, unknown> = {}) {
  const res = await page.request.post("/api/sets", {
    data: { clientId: crypto.randomUUID(), pen: "Front pen", startDate: new Date().toISOString().slice(0, 10), intake: 600, dayOldSupplier: "Zartech", dayOldUnitCost: 980, ...over },
  });
  expect(res.ok()).toBe(true);
  return ((await res.json()) as { id: string }).id;
}

// A farm day n days from today (UTC date is fine for e2e)
export function dayFromToday(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
