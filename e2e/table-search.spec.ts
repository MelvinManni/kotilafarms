// Tables: search narrows the rows, filters pick by a column's words, and one tap clears both
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

test("owner searches and filters the people table", async ({ page }) => {
  await signIn(page, E2E.owner.email, E2E.owner.password);
  await page.goto("/settings/users");
  const table = page.getByRole("table", { name: "People with access" });
  await expect(table.getByRole("row", { name: new RegExp(E2E.manager.name) })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search: People with access" }).fill("chinedu");
  await expect(table.getByRole("row", { name: new RegExp(E2E.recorder.name) })).toBeVisible();
  await expect(table.getByRole("row", { name: new RegExp(E2E.manager.name) })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Search: People with access" }).fill("nobody by this name");
  await expect(table.getByText("Nothing matches “nobody by this name”.")).toBeVisible();
  await table.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(table.getByRole("row", { name: new RegExp(E2E.manager.name) })).toBeVisible();

  await page.getByRole("button", { name: "Filter" }).click();
  await page.getByRole("group", { name: "Role" }).getByText("Manager").click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Filter, 1 picked" })).toBeVisible();
  await expect(table.getByRole("row", { name: new RegExp(E2E.manager.name) })).toBeVisible();
  await expect(table.getByRole("row", { name: new RegExp(E2E.recorder.name) })).toHaveCount(0);
});
