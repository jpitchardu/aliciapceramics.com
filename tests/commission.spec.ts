import { test, expect, type Page } from "@playwright/test";

/*
 * The /commission flow — the bulk-order steps with prices, a design option
 * and a one-to-nine piece range. Runs without Square credentials, so the
 * order API does a dry run.
 */

async function unlock(page: Page) {
  await page.goto("/commission");
  await page.getByLabel("your code").fill("little-cute-mugs");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByRole("heading", { name: /who am i talking to/i }),
  ).toBeVisible();
}

test.describe("commission", () => {
  test("the bulk code doesn't open it", async ({ page }) => {
    await page.goto("/commission");
    await page.getByLabel("your code").fill("buy-more-mugs");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/don't recognise that code/i)).toBeVisible();
  });

  test("walks from code to sent with a subtotal", async ({ page }) => {
    await unlock(page);
    await expect(page.getByLabel("shop or business")).toHaveCount(0);
    await page.getByLabel("your name").fill("june park");
    await page.getByLabel("email").fill("june@example.com");
    await page.getByRole("button", { name: /to the order/i }).click();

    const next = page.getByRole("button", { name: /to the vision/i });
    await expect(next).toBeDisabled();
    await expect(page.getByText("from $28")).toBeVisible();

    // two 12 oz mugs with a design: $42 each on the sheet
    await page.getByRole("button", { name: /^mug, with handle/ }).click();
    await page.getByRole("button", { name: "12 oz", exact: true }).click();
    await page.getByRole("button", { name: /with a design/ }).click();
    await page.getByLabel("quantity").fill("2");
    await expect(page.getByText("$42 each")).toBeVisible();
    await page.getByRole("button", { name: /add to your order/i }).click();
    await expect(next).toBeEnabled();

    // a matcha bowl
    await page.getByRole("button", { name: /^matcha bowl/ }).click();
    await page.getByRole("button", { name: /add to your order/i }).click();
    await expect(page.getByText("$134").first()).toBeAttached();

    // past nine is turned away
    await page.getByRole("button", { name: /^cup/ }).click();
    await page.getByLabel("quantity").fill("7");
    await page.getByRole("button", { name: /add to your order/i }).click();
    await expect(
      page.getByText(/up to nine pieces — there.s room for 6 more/i),
    ).toBeVisible();

    await next.click();
    await page.getByRole("button", { name: /read it back/i }).click();
    await expect(page.getByText(/subject to change/i).first()).toBeVisible();

    const send = page.getByRole("button", { name: /send to alicia/i });
    await page.getByText(/everything looks right/i).click();
    await send.click();

    await expect(
      page.getByRole("heading", { name: /thank you — i got your order/i }),
    ).toBeVisible();
    await expect(page.getByText(/three pieces, estimated for/i)).toBeVisible();
  });
});
