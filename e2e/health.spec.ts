// Health: a manager marks a vaccine given, records a treatment, and changes the default schedule
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { dayFromToday, signIn, startSetViaApi } from "./helpers";

test("manager marks Gumboro given and records a treatment", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { startDate: dayFromToday(-6) });
  await page.goto(`/sets/${setId}`);
  const setName = (await page.getByRole("heading", { level: 1 }).textContent())!.match(/Set \d+/)![0];

  await page.goto("/health");
  const panel = page.getByRole("region", { name: `Vaccine schedule · ${setName}` });
  const gumboro = panel.getByRole("row", { name: /Gumboro 1st dose/ });
  await expect(gumboro).toContainText("Due tomorrow");
  await gumboro.click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("button", { name: "Mark as given" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(gumboro).toContainText("Given");
  await expect(gumboro).toContainText("Day 6");

  // Move this Set's Lasota 1st dose from day 10 to day 12
  await panel.getByRole("button", { name: "Change schedule" }).click();
  const edit = page.getByRole("dialog");
  await edit.getByRole("spinbutton", { name: "Row 2: due on day" }).fill("12");
  await edit.getByRole("textbox", { name: "Why the change" }).fill("Vet's advice");
  await edit.getByRole("button", { name: "Save schedule" }).click();
  await expect(edit).toHaveCount(0);
  await expect(panel.getByRole("row", { name: /Lasota 1st dose/ })).toContainText("Day 12");

  await page.getByRole("button", { name: "Record a treatment" }).first().click();
  const treat = page.getByRole("dialog");
  await treat.getByRole("combobox", { name: "Set" }).click();
  await page.getByRole("option", { name: new RegExp(`^${setName} ·`) }).click();
  await treat.getByRole("button", { name: "Glucose" }).click();
  await expect(treat.getByRole("textbox", { name: "What was given" })).toHaveValue("Glucose");
  await treat.getByRole("textbox", { name: "Amount / dose" }).fill("2 kg in water on arrival");
  await treat.getByRole("textbox", { name: "Cost" }).fill("2400");
  await treat.getByRole("button", { name: "Save treatment" }).click();
  await expect(treat.getByText("Say why it was given.")).toBeVisible();
  await treat.getByRole("textbox", { name: "Why" }).fill("Travel stress");
  await treat.getByRole("button", { name: "Save treatment" }).click();
  await expect(treat).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Glucose/ }).first()).toContainText("₦2,400");
});

test("manager adds a dose to the default schedule", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/settings/vaccines");
  await page.getByRole("button", { name: "Add a dose" }).click();
  const rows = page.getByRole("textbox", { name: /: vaccine$/ });
  const n = await rows.count();
  await page.getByRole("textbox", { name: `Row ${n}: vaccine` }).fill("Fowl pox");
  await page.getByRole("spinbutton", { name: `Row ${n}: day of age` }).fill("28");
  await page.getByRole("textbox", { name: `Row ${n}: how it is given` }).fill("Wing web");
  await page.getByRole("button", { name: "Save the schedule" }).click();
  await expect(page.getByText("Saved. New Sets will start with this schedule.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: `Row ${n}: vaccine` })).toHaveValue("Fowl pox");
});
