import { test, expect, Page } from "@playwright/test";

const MOCK_BULK_CODE_RESPONSE = {
  success: true,
  valid: true,
  data: {
    id: "mock-bulk-id-123",
    code: "TEST2024",
    name: "Test Bulk Order",
    earliestCompletionDate: "2027-06-01",
  },
};

async function mockBulkCodeApi(page: Page) {
  await page.route("**/api/validateBulkCode", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_BULK_CODE_RESPONSE),
    });
  });
}

async function enterBulkCode(page: Page, code = "TEST2024") {
  await page.getByPlaceholder("Enter your code...").fill(code);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  // Wait for the form to appear (client-details step)
  await expect(page.getByText("let's get some info")).toBeVisible({
    timeout: 5000,
  });
}

async function fillClientDetails(page: Page) {
  await page.getByPlaceholder("your name").fill("Jane Doe");
  await page.getByPlaceholder("you@example.com").fill("jane@example.com");
  await page.getByPlaceholder("(555) 123-4567").fill("5551234567");
  await page
    .getByLabel("I prefer to receive all communication via email only")
    .check();
}

async function addDinnwarePieces(page: Page, quantity = 10) {
  // Expand the dinnerware card (last card in the list)
  await page.getByRole("button", { name: /dinnerware/i }).click();

  // Scope all interactions to the expanded card
  const expandedCard = page.locator(".option-card.expanded");

  // Fill quantity
  await expandedCard.getByPlaceholder("quantity").fill(String(quantity));

  // Fill description (TextArea has no htmlFor/id link so use locator)
  await expandedCard.locator("textarea").fill("Simple white dinnerware set");

  // Add to order
  const addButton = expandedCard.getByRole("button", { name: "Add to order" });
  await expect(addButton).toBeEnabled({ timeout: 2000 });
  await addButton.click();
}

test.describe("Bulk Order Form - Your Vision Step", () => {
  test("continue button is enabled on Your Vision step after completing prior steps", async ({
    page,
  }) => {
    await mockBulkCodeApi(page);
    await page.goto("/bulk");

    // Step 0: Code input
    await enterBulkCode(page);

    // Step 1: Client details
    await fillClientDetails(page);

    const clientContinue = page.getByRole("button", { name: "continue →" });
    await expect(clientContinue).toBeEnabled();
    await clientContinue.click();

    // Step 2: Add pieces
    await expect(page.getByText("what are you looking for?")).toBeVisible();
    await addDinnwarePieces(page, 10);

    const piecesContinue = page.getByRole("button", { name: "continue →" });
    await expect(piecesContinue).toBeEnabled({ timeout: 2000 });
    await piecesContinue.click();

    // Step 3: Your Vision
    await expect(page.getByText("Your vision")).toBeVisible();

    const visionContinue = page.getByRole("button", { name: "continue →" });
    // This is the bug: the continue button is disabled even though all fields are optional
    await expect(visionContinue).toBeEnabled();
  });

  test("continue button state with no user input on Your Vision step", async ({
    page,
  }) => {
    await mockBulkCodeApi(page);
    await page.goto("/bulk");
    await enterBulkCode(page);
    await fillClientDetails(page);

    await page.getByRole("button", { name: "continue →" }).click();
    await expect(page.getByText("what are you looking for?")).toBeVisible();
    await addDinnwarePieces(page, 10);
    await page.getByRole("button", { name: "continue →" }).click();

    await expect(page.getByText("Your vision")).toBeVisible();

    // Fields are optional - no input should still be valid
    const visionContinue = page.getByRole("button", { name: "continue →" });
    const isDisabled = await visionContinue.isDisabled();

    console.log(`Continue button disabled: ${isDisabled}`);
    console.log(
      "Expected: false (button should be enabled since all fields are optional)",
    );

    // Capture what the isValid logic actually resolves to by checking ARIA
    const ariaDisabled = await visionContinue.getAttribute("disabled");
    console.log(`Button disabled attribute: ${ariaDisabled}`);

    await expect(visionContinue).toBeEnabled();
  });

  test("Add to order button is enabled after filling required piece fields", async ({
    page,
  }) => {
    await mockBulkCodeApi(page);
    await page.goto("/bulk");
    await enterBulkCode(page);
    await fillClientDetails(page);
    await page.getByRole("button", { name: "continue →" }).click();

    await expect(page.getByText("what are you looking for?")).toBeVisible();

    // Expand dinnerware card
    await page.getByRole("button", { name: /dinnerware/i }).click();

    const expandedCard = page.locator(".option-card.expanded");
    const addButton = expandedCard.getByRole("button", {
      name: "Add to order",
    });

    // Initially disabled (quantity=1, description="" — schema may require description)
    console.log(
      `Add to order initially disabled: ${await addButton.isDisabled()}`,
    );

    // Fill quantity
    await expandedCard.getByPlaceholder("quantity").fill("10");
    console.log(
      `Add to order after quantity disabled: ${await addButton.isDisabled()}`,
    );

    // Fill description (TextArea has no htmlFor/id link so use locator)
    await expandedCard.locator("textarea").fill("Simple white dinnerware");
    console.log(
      `Add to order after description disabled: ${await addButton.isDisabled()}`,
    );

    await expect(addButton).toBeEnabled({ timeout: 2000 });
  });

  test("minimum 10 pieces warning appears when under minimum", async ({
    page,
  }) => {
    await mockBulkCodeApi(page);
    await page.goto("/bulk");
    await enterBulkCode(page);
    await fillClientDetails(page);
    await page.getByRole("button", { name: "continue →" }).click();

    await expect(page.getByText("what are you looking for?")).toBeVisible();

    // Add only 5 pieces
    await page.getByRole("button", { name: /dinnerware/i }).click();
    const expandedCard = page.locator(".option-card.expanded");
    await expandedCard.getByPlaceholder("quantity").fill("5");
    await expandedCard.locator("textarea").fill("Five pieces");
    await expandedCard.getByRole("button", { name: "Add to order" }).click();

    await expect(page.getByText(/more pieces needed/i)).toBeVisible();
  });
});

test.describe("Bulk Order Form - Code Input Step", () => {
  test("shows code input form on /bulk", async ({ page }) => {
    await page.goto("/bulk");
    await expect(page.getByText("BULK ORDER")).toBeVisible();
    await expect(
      page.getByText("Enter your bulk commission code to get started"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Enter your code...")).toBeVisible();
  });

  test("shows error for invalid code response", async ({ page }) => {
    await page.route("**/api/validateBulkCode", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          valid: false,
          message: "Invalid code",
        }),
      });
    });

    await page.goto("/bulk");
    await page.getByPlaceholder("Enter your code...").fill("BADCODE");
    await page.getByRole("button", { name: "CONTINUE" }).click();

    await expect(page.getByText("Invalid code")).toBeVisible();
  });

  test("transitions to client details after valid code", async ({ page }) => {
    await mockBulkCodeApi(page);
    await page.goto("/bulk");
    await enterBulkCode(page);

    await expect(page.getByText("let's get some info")).toBeVisible();
  });
});
