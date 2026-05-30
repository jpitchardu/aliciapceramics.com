import { test, expect } from "@playwright/test";

// These tests verify the gate behavior WITHOUT the bypass cookie,
// simulating a visitor before the shop opens.
// They rely on the dev server running with a future DROP.opensAt.

const BYPASS_KEY = process.env.GATE_BYPASS_KEY ?? "test-bypass";

test.describe("gate — closed (no bypass)", () => {
  test("visiting /shop redirects to /", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveURL("/");
  });

  test("visiting /cart redirects to /", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL("/");
  });

  test("visiting /shop/some-id redirects to /", async ({ page }) => {
    await page.goto("/shop/MDCV2BMWYMDYJO6DMQKNS2HA");
    await expect(page).toHaveURL("/");
  });

  test("countdown page shows hours/minutes/seconds", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/hours/i)).toBeVisible();
    await expect(page.getByText(/minutes/i)).toBeVisible();
    await expect(page.getByText(/seconds/i)).toBeVisible();
  });

  test("countdown page does not show enter the shop link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /enter the shop/i }),
    ).not.toBeVisible();
  });
});

test.describe("gate — bypass cookie", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "gate_bypass",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("bypass cookie allows /shop", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveURL("/shop");
  });

  test("bypass cookie allows /cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page).toHaveURL("/cart");
  });

  test("bypass cookie shows home page not countdown at /", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/hours/i)).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: /enter the shop/i }).first(),
    ).toBeVisible();
  });
});

test.describe("gate — bypass query param", () => {
  test("?bypass=<key> sets cookie and redirects to clean url", async ({
    page,
  }) => {
    await page.goto(`/?bypass=${BYPASS_KEY}`);
    // should redirect back to / without the query param
    await expect(page).toHaveURL("/");
    // now /shop should be accessible (cookie is set)
    await page.goto("/shop");
    await expect(page).toHaveURL("/shop");
  });
});
