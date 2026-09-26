// Sales: a sale to a new buyer leaves a balance that shows everywhere until a payment clears it
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn, startSetViaApi } from "./helpers";

test("sell 30 birds with ₦10,000 paid, then clear the balance", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { intake: 300 });
  await page.goto(`/sets/${setId}`);
  const setName = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/Set \d+/)![0];
  const buyer = `Mama Nkechi ${Date.now()}`;

  await page.goto("/sales");
  await page.getByRole("button", { name: "New sale" }).first().click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("combobox", { name: "Set" }).click();
  await page.getByRole("option", { name: new RegExp(`^${setName} ·`) }).click();
  await sheet.getByRole("combobox", { name: "Buyer" }).click();
  await page.getByRole("option", { name: "Add a new buyer" }).click();
  await sheet.getByRole("textbox", { name: "New buyer's name" }).fill(buyer);
  await sheet.getByRole("textbox", { name: "Birds" }).fill("30");
  await sheet.getByRole("textbox", { name: "Price per bird" }).fill("7500");
  await expect(sheet.getByRole("textbox", { name: "Sale total" })).toHaveValue("225,000");
  await sheet.getByRole("textbox", { name: "Paid now" }).fill("10000");
  await expect(sheet.getByRole("textbox", { name: "Still owed" })).toHaveValue("215,000");
  await sheet.getByRole("button", { name: "Save sale" }).click();
  await expect(sheet).toHaveCount(0);

  await expect(page.getByRole("row", { name: new RegExp(buyer) }).first()).toContainText("₦215,000");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /Sales/ })).toContainText(/\d/);

  await page.getByRole("row", { name: new RegExp(buyer) }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Record a payment" }).click();
  const pay = page.getByRole("dialog");
  await expect(pay.getByRole("textbox", { name: "Amount paid" })).toHaveValue("215,000");
  await pay.getByRole("button", { name: "Save payment" }).click();
  await expect(pay).toHaveCount(0);
  await expect(page.getByRole("table", { name: "Buyers who still owe money" }).getByRole("row", { name: new RegExp(buyer) })).toHaveCount(0);
});
