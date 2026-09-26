// Feed: a manager adds a feed in Settings, records a purchase, and sees stock, price and the run-out warning
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("manager adds a feed, buys it, and is warned before it runs out", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { startDate: dayFromToday(-5) });
  await page.goto(`/sets/${setId}`);
  const setName = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/Set \d+/)![0];

  await page.goto("/settings/feed");
  await page.getByRole("button", { name: "Add a feed" }).click();
  const add = page.getByRole("dialog");
  await add.getByRole("button", { name: "Grower", exact: true }).click();
  await add.getByRole("textbox", { name: "Brand" }).fill("Breedwell");
  await add.getByRole("button", { name: "Add feed" }).click();
  await expect(page.getByRole("row", { name: /Grower · Breedwell/ })).toBeVisible();

  await page.goto("/feed");
  await expect(page.getByText("No feed bought yet")).toBeVisible();
  await page.getByRole("button", { name: "Record a feed purchase" }).first().click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("combobox", { name: "Feed" }).click();
  await page.getByRole("option", { name: "Grower · Breedwell" }).click();
  await sheet.getByRole("textbox", { name: "Bags" }).fill("4");
  await sheet.getByRole("textbox", { name: "Total cost" }).fill("99200");
  await expect(sheet.getByRole("textbox", { name: "Price per bag" })).toHaveValue("24,800");
  await sheet.getByRole("button", { name: "Save purchase" }).click();
  await expect(sheet.getByText("Who sold it?")).toBeVisible();
  await expect(sheet.getByText("Choose a Set or farm overhead before saving.")).toBeVisible();
  await sheet.getByRole("textbox", { name: "Supplier" }).fill("Breedwell depot");
  await sheet.getByRole("textbox", { name: "Transport (separate line)" }).fill("3000");
  await sheet.getByRole("radio", { name: new RegExp(`^${setName}\\b`) }).click();
  await sheet.getByRole("button", { name: "Save purchase" }).click();
  await expect(sheet).toHaveCount(0);

  await expect(page.getByRole("region", { name: "Grower · Breedwell", exact: true })).toContainText("4 bags");
  await expect(page.getByRole("row", { name: /Grower · Breedwell/ })).toContainText("₦99,200");

  // Two days of 1 bag each: 2 bags left, about 2 days
  const feedTypeId = ((await (await page.request.get("/api/feed/types")).json()) as { id: string; brand: string }[]).find((t) => t.brand === "Breedwell")!.id;
  for (const n of [1, 0]) {
    const res = await page.request.post(`/api/sets/${setId}/logs`, { data: { clientId: crypto.randomUUID(), date: dayFromToday(-n), deaths: 0, feedTypeId, feedQty: 1, feedUnit: "bags" } });
    expect(res.ok()).toBe(true);
  }
  await page.reload();
  await expect(page.getByText("Grower runs out in about 2 days")).toBeVisible();
  await page.goto("/today");
  await expect(page.getByRole("link", { name: /Grower runs out in about 2 days/ })).toBeVisible();
});
