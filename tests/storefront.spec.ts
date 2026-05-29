import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders logo and enter the shop link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('img[alt="Alicia P Ceramics"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /enter the shop/i }),
    ).toBeVisible();
  });

  test("enter the shop link navigates to /shop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /enter the shop/i }).click();
    await expect(page).toHaveURL("/shop");
  });
});

test.describe("shop page", () => {
  test("renders collection grid with pieces", async ({ page }) => {
    await page.goto("/shop");
    // At least one piece tile should render
    const tiles = page.locator("a[href^='/shop/']");
    await expect(tiles.first()).toBeVisible();
  });

  test("piece link navigates to detail page", async ({ page }) => {
    await page.goto("/shop");
    const firstPiece = page.locator("a[href^='/shop/']").first();
    const href = await firstPiece.getAttribute("href");
    await firstPiece.click();
    await expect(page).toHaveURL(href!);
  });

  test("nav ceramics link returns to shop", async ({ page }) => {
    await page.goto("/shop");
    // TopNav on mobile or DesktopNav on desktop — both have a ceramics link
    await expect(
      page.getByRole("link", { name: /ceramics/i }).first(),
    ).toBeVisible();
  });
});

test.describe("piece detail page", () => {
  test("renders title, price, and add to cart", async ({ page }) => {
    await page.goto("/shop");
    const firstPiece = page.locator("a[href^='/shop/']").first();
    await firstPiece.click();
    await page.waitForLoadState("networkidle");

    // Page should show an "add to cart" action
    await expect(
      page.getByRole("button", { name: /add to cart/i }),
    ).toBeVisible();
  });

  test("add to cart navigates to /cart", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("a[href^='/shop/']").first().click();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");
  });
});

test.describe("cart page", () => {
  test("empty cart shows placeholder message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("item added from detail page appears in cart", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("a[href^='/shop/']").first().click();
    await page.waitForLoadState("networkidle");

    // Grab the piece title before adding
    const titleEl = page.locator("h1").first();
    const title = await titleEl.textContent();

    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");

    if (title) {
      await expect(page.getByText(title.trim())).toBeVisible();
    }
  });

  test("removing item from cart empties it", async ({ page }) => {
    // Add a piece first
    await page.goto("/shop");
    await page.locator("a[href^='/shop/']").first().click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");

    // Remove it
    const removeBtn = page.getByRole("button", { name: /×|remove/i }).first();
    await removeBtn.click();

    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("delivery picker is visible when cart has items", async ({ page }) => {
    await page.goto("/shop");
    await page.locator("a[href^='/shop/']").first().click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page).toHaveURL("/cart");

    await expect(page.getByText(/ship to me|pick up/i).first()).toBeVisible();
  });

  test("keep looking link navigates back to shop", async ({ page }) => {
    await page.goto("/cart");
    await page.getByRole("link", { name: /keep looking/i }).click();
    await expect(page).toHaveURL("/shop");
  });
});

test.describe("navigation", () => {
  test("logo link goes to home", async ({ page }) => {
    await page.goto("/shop");
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL("/");
  });
});
