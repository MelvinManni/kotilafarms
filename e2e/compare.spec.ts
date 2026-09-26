// Compare Sets: a manager adds and removes Sets, sees the best per row, and downloads the PDF
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn, startSetViaApi } from "./helpers";

test("manager compares Sets side by side", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await startSetViaApi(page, { intake: 150 });
  await startSetViaApi(page, { intake: 160 });
  await startSetViaApi(page, { intake: 170 });
  await page.goto("/reports/compare");
  await expect(page.getByRole("table", { name: "Sets compared by metric" })).toBeVisible();
  await expect(page.getByRole("row", { name: /^Mortality/ })).toBeVisible();
  await page.getByRole("button", { name: "Add a Set" }).click();
  await expect(page.getByRole("combobox", { name: "Third Set" })).toBeVisible();
  await page.getByRole("button", { name: /from the comparison$/ }).click();
  await expect(page.getByRole("combobox", { name: "Third Set" })).toHaveCount(0);
  await expect(page.getByText("2 picked · a Set picked in one list is removed from the others")).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download PDF" }).click()]);
  expect(download.suggestedFilename()).toBe("kotila-compare-sets.pdf");
  expect(readFileSync((await download.path())!).subarray(0, 5).toString()).toBe("%PDF-");
});
