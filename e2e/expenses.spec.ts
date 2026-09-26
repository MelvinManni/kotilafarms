// Expenses: Set-or-overhead can't be skipped; an expense shows in the list and totals; the + tab adds one on a phone
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn, startSetViaApi } from "./helpers";

test("manager must choose a Set or overhead, then the expense counts", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { intake: 100, dayOldUnitCost: 1000 });
  await page.goto(`/sets/${setId}`);
  const setName = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/Set \d+/)![0];

  await page.goto("/expenses");
  await page.getByRole("button", { name: "Add expense" }).first().click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Amount" }).fill("18500");
  await sheet.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Litter (sawdust)" }).click();
  await sheet.getByRole("textbox", { name: "What for" }).fill("12 bags of sawdust");
  await sheet.getByRole("button", { name: "Save expense" }).click();
  await expect(sheet.getByText("Choose a Set or farm overhead before saving.")).toBeVisible();

  await sheet.getByRole("radio", { name: new RegExp(`^${setName}`) }).click();
  await sheet.getByRole("button", { name: "Save expense" }).click();
  await expect(sheet).toHaveCount(0);
  const row = page.getByRole("row", { name: /12 bags of sawdust/ });
  await expect(row).toContainText("₦18,500");
  await expect(row).toContainText(setName);

  await page.goto(`/sets/${setId}`);
  await expect(page.getByText("₦118,500").first()).toBeVisible();
});

test("the + tab adds an overhead expense on a phone @phone", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.getByRole("link", { name: "Add an expense" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Amount" }).fill("12000");
  await sheet.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Other" }).click();
  await sheet.getByRole("textbox", { name: "What for" }).fill("Diesel for the generator");
  await sheet.getByRole("radio", { name: /Farm overhead/ }).click();
  await sheet.getByRole("button", { name: "Save expense" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Diesel for the generator/ })).toContainText("₦12,000");
});
