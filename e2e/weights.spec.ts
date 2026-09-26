// Weights: a recorder weighs a Set on a phone; a manager edits the breed standard
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("recorder weighs a Set, changes a weight, and saves a small sample @phone", async ({ page, browser }) => {
  const manager = await browser.newPage();
  await signIn(manager, E2E.manager.email, E2E.manager.password);
  await startSetViaApi(manager, { startDate: dayFromToday(-24) });
  await manager.close();

  await signIn(page, E2E.recorder.email, E2E.recorder.password);
  await page.goto("/weigh");
  await page.getByRole("link", { name: /Weigh Set \d+ · day 24/ }).first().click();
  const add = page.getByRole("textbox", { name: "Add weight in grams" });
  for (const g of ["1,018", "964", "1088", "862"]) {
    await add.fill(g);
    await add.press("Enter");
  }
  await expect(page.getByText("Only 4 of the 10 birds asked for. You can still save.")).toBeVisible();
  await expect(page.getByText("0.98 kg", { exact: true })).toBeVisible();

  await add.fill("1.03");
  await add.press("Enter");
  await expect(page.getByText("Grams only, no decimals.")).toBeVisible();

  await page.getByRole("button", { name: "Bird 4: 862 g. Tap to change" }).click();
  const bird4 = page.getByRole("textbox", { name: "Bird 4 weight in grams" });
  await bird4.fill("1062");
  await bird4.press("Enter");
  await expect(page.getByText("1.03 kg", { exact: true })).toBeVisible();
  await expect(page.getByText(/under the standard for day 24/)).toBeVisible();

  await add.fill("");
  await page.getByRole("button", { name: "Save sample (4 birds)" }).click();
  await expect(page.getByText(/^Saved: Set \d+ weights/)).toBeVisible();
  await expect(page.getByText("4 birds, averaging 1.03 kg.")).toBeVisible();
});

test("manager edits the breed standard in Settings", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/settings/breed");
  await expect(page.getByRole("region", { name: "How it looks" })).toBeVisible();
  const rows = page.getByRole("spinbutton", { name: /standard grams/ });
  const before = await rows.count();
  await page.getByRole("button", { name: "Add a day" }).click();
  await expect(rows).toHaveCount(before + 1);
  await page.getByRole("button", { name: `Remove row ${before + 1}` }).click();
  await rows.first().fill("45");
  await page.getByRole("button", { name: "Save the standard" }).click();
  await expect(page.getByText("Saved. Every Set now measures against this.")).toBeVisible();
  await page.reload();
  await expect(rows.first()).toHaveValue("45");
});

test("Set detail and Today show growth against the standard", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { startDate: dayFromToday(-24) });
  const weigh = (date: string, grams: number[]) => page.request.post(`/api/sets/${setId}/weights`, { data: { clientId: crypto.randomUUID(), date, weightsGrams: grams } });
  expect((await weigh(dayFromToday(-10), [430, 440])).ok()).toBe(true);
  await page.goto(`/sets/${setId}`);
  await expect(page.getByRole("region", { name: /9% under weight at day 14/ })).toBeVisible();
  expect((await weigh(dayFromToday(0), [1020, 1040])).ok()).toBe(true);
  await page.reload();
  await expect(page.getByRole("region", { name: "10% under weight at day 24, and the gap is widening" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Day 24: 1.03 kg against 1.15 kg standard/ })).toBeVisible();
  await page.goto("/today");
  await expect(page.getByRole("region", { name: /^Set \d+ is \d+% (under|over)/ })).toBeVisible();
});
