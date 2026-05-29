import { test, expect } from "@playwright/test";

// Desktop Chrome viewport (1280×720): "hidden lg:block" content visible,
// "lg:hidden" content hidden.

test.describe("home page", () => {
  test("renders logo and enter the shop link", async ({ page }) => {
    await page.goto("/");
    // Desktop logo is the second img (first is in lg:hidden TopNav)
    await expect(
      page.locator('img[alt="alicia p. ceramics"]').nth(1),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /enter the shop/i }).first(),
    ).toBeVisible();
  });

  test("enter the shop link navigates to /shop", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /enter the shop/i })
      .first()
      .click();
    await expect(page).toHaveURL("/shop");
  });
});

test.describe("shop page", () => {
  test("renders collection grid with pieces", async ({ page }) => {
    await page.goto("/shop");
    // At least one piece link exists in the DOM (desktop grid)
    await expect(page.locator("a[href^='/shop/']").first()).toBeAttached();
  });

  test("piece link navigates to detail page", async ({ page }) => {
    await page.goto("/shop");
    const href = await page
      .locator("a[href^='/shop/']")
      .first()
      .getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!);
    await expect(page).toHaveURL(href!);
  });

  test("nav ceramics link is present", async ({ page }) => {
    await page.goto("/shop");
    await expect(
      page.getByRole("link", { name: /ceramics/i }).first(),
    ).toBeVisible();
  });
});

test.describe("piece detail page", () => {
  test("renders add to cart button", async ({ page }) => {
    await page.goto("/shop/014");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: /add to cart/i }),
    ).toBeVisible();
  });

  test("add to cart navigates to /cart", async ({ page }) => {
    await page.goto("/shop/014");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");
  });
});

test.describe("cart page", () => {
  test("empty cart shows placeholder message", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("item added from detail page appears in cart", async ({ page }) => {
    await page.goto("/shop/014");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");

    // Cart should have at least one item row (× remove button present)
    await expect(
      page.locator("button", { hasText: "×" }).first(),
    ).toBeVisible();
  });

  test("removing item from cart empties it", async ({ page }) => {
    await page.goto("/shop/014");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");

    await page.locator("button", { hasText: "×" }).first().click();

    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("delivery picker is visible when cart has items", async ({ page }) => {
    await page.goto("/shop/014");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/ship to me|pick up/i).first()).toBeVisible();
  });

  test("keep looking link navigates back to shop", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    // "← keep looking" is a Link rendered client-side; find by href
    await page.locator('a[href="/shop"]').first().click();
    await expect(page).toHaveURL("/shop");
  });
});

test.describe("navigation", () => {
  test("logo link goes to home", async ({ page }) => {
    await page.goto("/shop");
    // Desktop nav logo link (second a[href="/"]) — first is in hidden TopNav
    await page.locator('a[href="/"]').nth(1).click();
    await expect(page).toHaveURL("/");
  });
});
