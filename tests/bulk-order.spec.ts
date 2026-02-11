import { test, expect } from "@playwright/test";

test.describe("Bulk Order Form", () => {
  test("should validate and accept a valid bulk code", async ({ page }) => {
    await page.goto("/bulk");

    await expect(
      page.getByRole("heading", { name: /BULK ORDER/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Enter your bulk commission code/i),
    ).toBeVisible();

    await page.getByPlaceholder(/Enter your code/i).fill("TEST2024");
    await page.getByRole("button", { name: /CONTINUE/i }).click();

    await expect(page.getByText(/Test Bulk Order/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/TEST2024/i)).toBeVisible();
    await expect(page.getByText(/Minimum 10 pieces required/i)).toBeVisible();
  });

  test("should show error for invalid bulk code", async ({ page }) => {
    await page.goto("/bulk");

    await page.getByPlaceholder(/Enter your code/i).fill("INVALID123");
    await page.getByRole("button", { name: /CONTINUE/i }).click();

    await expect(page.getByText(/Invalid code/i)).toBeVisible();
  });

  test("should display bulk order header with code details", async ({
    page,
  }) => {
    await page.goto("/bulk");

    await page.getByPlaceholder(/Enter your code/i).fill("TEST2024");
    await page.getByRole("button", { name: /CONTINUE/i }).click();

    await expect(
      page.getByRole("heading", { name: /BULK ORDER: Test Bulk Order/i }),
    ).toBeVisible();
    await expect(page.getByText(/Code: TEST2024/i)).toBeVisible();
    await expect(page.getByText(/Minimum 10 pieces required/i)).toBeVisible();
  });
});
