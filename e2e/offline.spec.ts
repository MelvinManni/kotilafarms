// Offline: log with no signal, reload, send when signal returns — exactly one row; a lost reply still makes one row
import { expect, test, type Page } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

async function setUp(page: Page, browser: import("@playwright/test").Browser) {
  const manager = await browser.newPage();
  await signIn(manager, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(manager, { startDate: dayFromToday(-4) });
  await manager.close();
  await signIn(page, E2E.recorder.email, E2E.recorder.password);
  // Open the pages once with signal so the phone has them
  await page.goto(`/log/${setId}`);
  await expect(page.getByRole("heading", { name: /Daily log · Set/ })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  return setId;
}

const serverLogs = async (page: Page, setId: string) => ((await (await page.request.get(`/api/sets/${setId}/logs`)).json()) as { date: string }[]).map((l) => l.date);

test("a log saved with no signal is kept, survives a reload, and arrives once @phone", async ({ page, context, browser }) => {
  const setId = await setUp(page, browser);
  const day = dayFromToday(-1);
  await page.goto(`/log/${setId}/${day}`);
  await expect(page.getByRole("button", { name: "Increase Deaths that day" })).toBeVisible();

  await context.setOffline(true);
  await page.getByRole("button", { name: "Increase Deaths that day" }).click();
  await page.getByRole("button", { name: /^Save / }).click();
  await expect(page.getByText(/^Saved on this phone: Set/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Offline · 1 waiting/ })).toBeVisible();

  // Reload with no signal: the page comes from the phone, filled from the entry waiting there
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: /^1\s*birds$/ })).toBeVisible();
  await page.goto(`/log/${setId}`);
  await expect(page.getByRole("row", { name: /On this phone/ })).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByRole("button", { name: /All synced/ })).toBeVisible({ timeout: 20_000 });
  expect((await serverLogs(page, setId)).filter((d) => d === day)).toHaveLength(1);
});

test("a reply lost mid-send is retried and still makes one row @phone", async ({ page, browser }) => {
  const setId = await setUp(page, browser);
  const day = dayFromToday(-2);
  let dropped = false;
  // The server saves the log, but the phone never hears back
  await page.route("**/api/sync", async (route) => {
    if (dropped) return route.continue();
    dropped = true;
    await route.fetch();
    await route.abort("connectionreset");
  });
  await page.goto(`/log/${setId}/${day}`);
  await page.getByRole("button", { name: "Increase Deaths that day" }).click();
  await page.getByRole("button", { name: /^Save / }).click();
  await expect(page.getByText(/^Saved on this phone: Set/)).toBeVisible();
  expect(dropped).toBe(true);

  await page.getByRole("button", { name: /Offline · 1 waiting|Sending/ }).first().click();
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText("Everything on this phone has reached the farm records.")).toBeVisible({ timeout: 20_000 });
  expect((await serverLogs(page, setId)).filter((d) => d === day)).toHaveLength(1);
});
