// Capital and loans: an owner builds the register, records money in and a loan, repays it, removes and pays out a shareholder; managers can't open it
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

test("owner records capital and a loan, then repays it", async ({ page }) => {
  await signIn(page, E2E.owner.email, E2E.owner.password);
  await page.goto("/finance");
  await page.getByRole("tab", { name: "Capital and loans" }).click();
  await expect(page).toHaveURL(/\/finance\/capital$/);

  await page.getByRole("button", { name: "Add a shareholder" }).click();
  let sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Name" }).fill("Emeka");
  await sheet.getByRole("textbox", { name: "Shares held" }).fill("120173");
  await sheet.getByRole("button", { name: "Add shareholder" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("row", { name: /^Emeka/ })).toContainText("120,173");

  // Correct the share count
  await page.getByRole("row", { name: /^Emeka/ }).click();
  sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Shares held" }).fill("120174");
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await expect(sheet.getByText("Say why the register changed.")).toBeVisible();
  await sheet.getByRole("textbox", { name: "Why it changed" }).fill("One share transferred");
  await sheet.getByRole("button", { name: "Save changes" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("row", { name: /^Emeka/ })).toContainText("120,174");

  await page.getByRole("button", { name: "Record a contribution" }).click();
  sheet = page.getByRole("dialog");
  await sheet.getByRole("combobox", { name: "Shareholder" }).click();
  await page.getByRole("option", { name: "Emeka" }).click();
  await sheet.getByRole("textbox", { name: "Amount" }).fill("360000");
  await sheet.getByRole("button", { name: "Save" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("row", { name: /^Emeka/ })).toContainText("₦360,000");

  await page.getByRole("button", { name: "Record a loan" }).click();
  sheet = page.getByRole("dialog");
  await sheet.getByRole("combobox", { name: "Lender" }).click();
  await page.getByRole("option", { name: "Emeka" }).click();
  await sheet.getByRole("textbox", { name: "Amount lent" }).fill("100000");
  await sheet.getByRole("button", { name: "Save loan" }).click();
  await expect(sheet).toHaveCount(0);
  const loan = page.getByRole("table", { name: "Loans from shareholders to the farm" }).getByRole("row", { name: /^Emeka/ });
  await expect(loan).toContainText("Outstanding");

  await loan.click();
  await page.getByRole("dialog").getByRole("button", { name: "Mark repaid" }).click();
  await expect(loan).toContainText("Repaid");

  // Remove Emeka, then pay them out: only money taken out is possible
  const register = page.getByRole("table", { name: "Shareholders, their shares and their money in the company" });
  await register.getByRole("row", { name: /^Emeka/ }).click();
  sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Why it changed" }).fill("Sold his shares");
  await sheet.getByRole("button", { name: "Remove from the register" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(register.getByRole("row", { name: /Emeka \(removed/ })).toContainText("Removed");

  await page.getByRole("button", { name: "Record a withdrawal" }).click();
  sheet = page.getByRole("dialog");
  await sheet.getByRole("combobox", { name: "Shareholder" }).click();
  await page.getByRole("option", { name: "Emeka (removed)" }).click();
  await expect(sheet.getByText("only money taken out can be recorded")).toBeVisible();
  await sheet.getByRole("textbox", { name: "Amount" }).fill("60000");
  await sheet.getByRole("button", { name: "Save" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(register.getByRole("row", { name: /Emeka \(removed/ })).toContainText("₦300,000");
});

test("managers don't get capital and loans", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/finance");
  await expect(page.getByRole("tab", { name: "Capital and loans" })).toHaveCount(0);
  await page.goto("/finance/capital");
  await expect(page).not.toHaveURL(/\/finance\/capital$/);
});
