// Today: the recorder sees missed days and what to log; the owner sees active Sets and tasks
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("recorder's Today names the missed day and leads to logging @phone", async ({ page, browser }) => {
  const manager = await browser.newPage();
  await signIn(manager, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(manager, { startDate: dayFromToday(-2), pen: "Front pen" });
  await manager.goto(`/sets/${setId}`);
  const setName = (await manager.getByRole("heading", { level: 1 }).textContent())!.match(/Set \d+/)![0];
  await manager.close();

  await signIn(page, E2E.recorder.email, E2E.recorder.password);
  await expect(page.getByText(new RegExp(`${setName} has no log for`)).first()).toBeVisible();
  await page.getByRole("link", { name: new RegExp(`${setName} · day 2`) }).click();
  await expect(page).toHaveURL(new RegExp(`/log/${setId}/`));
});

test("owner's Today lists active Sets and what needs doing", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Today on the farm" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Active Sets" }).getByRole("row").nth(1)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Needs doing today" })).toBeVisible();
});
