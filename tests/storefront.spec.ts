import { test, expect } from "@playwright/test";

// All tests set the bypass cookie so the gate doesn't block navigation.
// Gate behavior is tested in tests/gate.spec.ts.

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "gate_bypass", value: "1", domain: "localhost", path: "/" },
  ]);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function firstPieceHref(page: import("@playwright/test").Page) {
  const href = await page
    .locator("a[href^='/shop/']")
    .first()
    .getAttribute("href");
  expect(href).toBeTruthy();
  return href!;
}

// ── Home page ─────────────────────────────────────────────────────────────────

test.describe("home page", () => {
  test("renders logo and enter the shop link", async ({ page }) => {
    await page.goto("/");
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

  test("bypass cookie shows home page not countdown", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/hours/i)).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: /enter the shop/i }).first(),
    ).toBeVisible();
  });
});

// ── Shop page ─────────────────────────────────────────────────────────────────

test.describe("shop page", () => {
  test("renders piece grid", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("a[href^='/shop/']").first()).toBeAttached();
  });

  test("piece link navigates to detail page", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    await expect(page).toHaveURL(href);
  });

  test("shows piece count", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText(/\d+ pieces/i).first()).toBeVisible();
  });

  test("nav shop link is visible on desktop", async ({ page }) => {
    await page.goto("/shop");
    await expect(
      page.getByRole("link", { name: /^shop$/i }).first(),
    ).toBeVisible();
  });
});

test.describe("shop page — filters", () => {
  test("filter dropdown visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/shop");
    await expect(page.getByText(/filter:/i)).toBeVisible();
  });

  test("filter menu opens and lists categories on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/shop");
    await page.getByText(/filter:/i).click();
    await expect(page.getByText(/cups|bowls|all/i).first()).toBeVisible();
  });

  test("picking a category filter updates url and narrows results", async ({
    page,
  }) => {
    await page.goto("/shop");
    const totalAll = await page.locator("a[href^='/shop/']").count();

    const filterButtons = page.locator(".hidden.lg\\:flex button");
    if ((await filterButtons.count()) > 1) {
      await filterButtons.nth(1).click();
      await page.waitForURL(/\?cat=/);
      const totalFiltered = await page.locator("a[href^='/shop/']").count();
      expect(totalFiltered).toBeGreaterThan(0);
      expect(totalFiltered).toBeLessThanOrEqual(totalAll);
    }
  });

  test("direct cat url filters pieces", async ({ page }) => {
    await page.goto("/shop?cat=DLWWZFQLXFYHZZKMICVWAYF6");
    const filtered = await page.locator("a[href^='/shop/']").count();
    await page.goto("/shop");
    const all = await page.locator("a[href^='/shop/']").count();
    expect(filtered).toBeGreaterThan(0);
    expect(all).toBeGreaterThan(filtered);
  });
});

// ── Piece detail page ─────────────────────────────────────────────────────────

test.describe("piece detail page", () => {
  test("renders title and price", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    await expect(page.locator("text=/\\$/").first()).toBeVisible();
  });

  test("renders add to cart or taken label", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    const taken = page.getByText(/^taken$/i);
    await expect(addBtn.or(taken).first()).toBeVisible();
  });

  test("piece with multiple images shows thumbnail strip", async ({ page }) => {
    // Fixture: Look 12oz Cup has 3 images
    await page.goto("/shop/MDCV2BMWYMDYJO6DMQKNS2HA");
    await page.waitForLoadState("networkidle");
    const thumbButtons = page
      .locator("button")
      .filter({ has: page.locator("img[alt='']") });
    await expect(thumbButtons.first()).toBeVisible();
    expect(await thumbButtons.count()).toBeGreaterThan(1);
  });

  test("clicking thumbnail activates it", async ({ page }) => {
    await page.goto("/shop/MDCV2BMWYMDYJO6DMQKNS2HA");
    await page.waitForLoadState("networkidle");
    const thumbButtons = page
      .locator("button")
      .filter({ has: page.locator("img[alt='']") });
    if ((await thumbButtons.count()) > 1) {
      await thumbButtons.nth(1).click();
      await expect(thumbButtons.nth(1)).toHaveCSS("opacity", "1");
      await expect(thumbButtons.nth(0)).toHaveCSS("opacity", "0.45");
    }
  });

  test("piece with single image has no thumbnail strip", async ({ page }) => {
    // Fixture: Deep Blue Tea Bowl has 1 image
    await page.goto("/shop/FIXTURE_BOWL_003");
    await page.waitForLoadState("networkidle");
    const thumbButtons = page
      .locator("button")
      .filter({ has: page.locator("img[alt='']") });
    expect(await thumbButtons.count()).toBe(0);
  });

  test("does not show hardcoded specs text", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    await expect(page.getByText(/food safe, dishwasher fine/i)).not.toBeVisible();
    await expect(page.getByText(/ships — or pick up in studio/i)).not.toBeVisible();
  });

  test("back link returns to shop", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    await page.locator("a[href='/shop']").first().click();
    await expect(page).toHaveURL("/shop");
  });

  test("more pieces section is visible", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    await expect(
      page.getByText(/more pieces|more from/i).first(),
    ).toBeVisible();
  });

  test("add to cart navigates to /cart", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page).toHaveURL("/cart");
    }
  });
});

// ── Cart page ─────────────────────────────────────────────────────────────────

test.describe("cart page", () => {
  test("empty cart shows placeholder message", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("item added from detail page appears in cart", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    if (!(await addBtn.isVisible())) return;
    await addBtn.click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("button", { hasText: "×" }).first(),
    ).toBeVisible();
  });

  test("removing item from cart empties it", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    if (!(await addBtn.isVisible())) return;
    await addBtn.click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");
    await page.locator("button", { hasText: "×" }).first().click();
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });

  test("delivery picker visible when cart has items", async ({ page }) => {
    await page.goto("/shop");
    const href = await firstPieceHref(page);
    await page.goto(href);
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    if (!(await addBtn.isVisible())) return;
    await addBtn.click();
    await expect(page).toHaveURL("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/ship to me|pick up/i).first()).toBeVisible();
  });

  test("keep looking navigates back to shop", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await page.locator('a[href="/shop"]').first().click();
    await expect(page).toHaveURL("/shop");
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

test.describe("navigation — desktop", () => {
  test("logo link goes to home", async ({ page }) => {
    await page.goto("/shop");
    await page.locator('a[href="/"]').nth(1).click();
    await expect(page).toHaveURL("/");
  });

  test("shop link in desktop nav is visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /^shop$/i }).first(),
    ).toBeVisible();
  });
});

test.describe("navigation — mobile hamburger", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test("hamburger button is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();
  });

  test("shop and archive links are hidden before open", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /^shop$/i }).first(),
    ).not.toBeVisible();
  });

  test("hamburger reveals shop link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /menu/i }).click();
    await expect(
      page.getByRole("link", { name: /^shop$/i }).first(),
    ).toBeVisible();
  });

  test("clicking shop in menu navigates to /shop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("link", { name: /^shop$/i }).first().click();
    await expect(page).toHaveURL("/shop");
  });
});
