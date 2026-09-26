// Daily log: a recorder logs today on a phone and fills in a missed day; a manager corrects a past day with a reason
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("recorder logs today, then a missed day, on a phone @phone", async ({ page, browser }) => {
  const manager = await browser.newPage();
  await signIn(manager, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(manager, { startDate: dayFromToday(-3) });
  await manager.close();

  await signIn(page, E2E.recorder.email, E2E.recorder.password);
  await page.getByRole("link", { name: "Log", exact: true }).click();
  await page.getByRole("link", { name: /day 3/ }).first().click();
  await expect(page.getByText("600 live after today")).toBeVisible();
  await page.getByRole("button", { name: "Increase Deaths today" }).click();
  await page.getByRole("button", { name: "Increase Deaths today" }).click();
  await expect(page.getByText("598 live after today")).toBeVisible();
  await page.getByRole("button", { name: "Wet litter" }).click();
  await page.getByRole("button", { name: "Save today’s log" }).click();

  await expect(page).toHaveURL(new RegExp(`/log/${setId}\\?saved=`));
  await expect(page.getByText(/^Saved: Set \d+/)).toBeVisible();
  // Days 1 and 2 were never logged
  const fillIn = page.getByRole("link", { name: /^Fill in / }).first();
  await expect(fillIn).toBeVisible();
  await fillIn.click();
  await page.getByRole("button", { name: /^Save / }).click();
  await expect(page.getByText(/^Saved: Set \d+/)).toBeVisible();
  await expect(page.getByRole("link", { name: /^Fill in / })).toHaveCount(1);
});

test("manager corrects a past day with a reason and sees it in the history", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { startDate: dayFromToday(-5) });
  const day = dayFromToday(-2);
  await page.goto(`/log/${setId}/${day}`);
  await page.getByRole("button", { name: "Increase Deaths that day" }).click();
  await page.getByRole("button", { name: /^Save / }).click();
  await expect(page.getByText(/^Saved/)).toBeVisible();

  await page.goto(`/log/${setId}/${day}`);
  await page.getByRole("button", { name: "Increase Deaths that day" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Say why you're changing this after the day.")).toBeVisible();
  await page.getByLabel("Why are you changing this?").fill("Found one more under the drinkers.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/^Saved/)).toBeVisible();
  await expect(page.getByRole("row", { name: /edited, was 1/ })).toBeVisible();

  await page.goto(`/log/${setId}/${day}`);
  await page.getByRole("button", { name: /Edit history/ }).click();
  await expect(page.getByText("“Found one more under the drinkers.”")).toBeVisible();
});
