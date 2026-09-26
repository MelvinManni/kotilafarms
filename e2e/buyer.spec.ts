// Buyer page: a buyer paying under the bulk rate is named, with every sale and payment
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("buyer page shows price against the bulk rate, sales and payments", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { intake: 300, startDate: dayFromToday(-40) });
  const name = `Alhaji Sule ${Date.now()}`;
  const buyer = await (await page.request.post("/api/buyers", { data: { clientId: crypto.randomUUID(), name, phone: "0803 555 0142" } })).json();
  const sale = await page.request.post("/api/sales", { data: { clientId: crypto.randomUUID(), setId, date: dayFromToday(-1), buyerId: buyer.id, birds: 50, pricePerBird: 7_171, total: 358_550, paidAtSale: 304_950, method: "transfer" } });
  expect(sale.ok()).toBe(true);

  await page.goto(`/sales/buyers/${buyer.id}`);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.getByText(`${name} pays about ₦330 a bird less than the bulk rate`)).toBeVisible();
  await expect(page.getByRole("table", { name: `Every sale to ${name}, newest first` })).toContainText("₦53,600");
  await expect(page.getByRole("table", { name: `Payments from ${name}, newest first` })).toContainText("₦304,950");

  await page.getByRole("button", { name: "Record a payment" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Save payment" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("table", { name: `Payments from ${name}, newest first` })).toContainText("₦53,600");
  await expect(page.getByRole("button", { name: "Record a payment" })).toHaveCount(0);
});
