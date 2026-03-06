import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    indexedDB.deleteDatabase("drawDB");
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("MYPRIMETYPE default validation surfaces issues", async ({ page }) => {
  await page.goto("/editor");

  await page.getByText("Generic", { exact: true }).click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.getByRole("button", { name: "Add table" }).click();

  await page.getByText(/^table_/).first().click();

  const tableNameInput = page.getByPlaceholder("Name").first();
  await tableNameInput.fill("my_table");

  const fieldNameInput = page.locator('input[id^="scroll_table_"]').first();
  await fieldNameInput.fill("prime_val");

  const fieldRow = fieldNameInput.locator(
    'xpath=ancestor::div[contains(@class,"hover-1")]',
  );
  await fieldRow.locator(".semi-select").first().click();
  await page.getByText("MYPRIMETYPE", { exact: true }).click();

  await fieldRow.locator("button").last().click();
  const defaultInput = page.getByPlaceholder("Default");
  await defaultInput.fill("2");

  await page.getByText("Issues").click();
  await expect(
    page.getByText(
      "Default value for field 'prime_val' in table 'my_table' does not match its type",
    ),
  ).toBeVisible();

  await defaultInput.fill("3");
  await expect(page.getByText("No issues were detected.")).toBeVisible();
});
