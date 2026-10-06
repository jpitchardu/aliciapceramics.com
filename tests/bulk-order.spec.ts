import { test, expect, type Page } from "@playwright/test";

/*
 * The /wholesale bulk-order flow. Runs without Square credentials, so the
 * order API does a dry run instead of creating anything in Square.
 */

async function unlock(page: Page) {
  await page.goto("/wholesale");
  await page.getByLabel("your code").fill("buy-more-mugs");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByRole("heading", { name: /who am i talking to/i }),
  ).toBeVisible();
}

async function addLine(page: Page, piece: string, qty: number, size?: string) {
  await page.getByRole("button", { name: new RegExp(`^${piece}`) }).click();
  if (size) await page.getByRole("radio", { name: size }).click();
  await page.getByLabel("quantity").fill(String(qty));
  await page.getByRole("button", { name: /add to line sheet/i }).click();
}

test.describe("bulk order", () => {
  test("the old /bulk link lands on the new flow", async ({ page }) => {
    await page.goto("/bulk");
    await expect(page).toHaveURL(/\/wholesale$/);
    await expect(
      page.getByRole("heading", { name: /do you have a code/i }),
    ).toBeVisible();
  });

  test("an unknown code is turned away gently", async ({ page }) => {
    await page.goto("/wholesale");
    await page.getByLabel("your code").fill("NOT-A-CODE");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/don't recognise that code/i)).toBeVisible();
  });

  test("about you asks for a name, the shop and a real email", async ({
    page,
  }) => {
    await unlock(page);
    await page.getByRole("button", { name: /to the order/i }).click();
    await expect(page.getByText(/your name, please/i)).toBeVisible();
    await expect(page.getByText(/the shop's name, please/i)).toBeVisible();
    await expect(
      page.getByText(/that email doesn't look right/i),
    ).toBeVisible();
  });

  test("walks from code to sent", async ({ page }) => {
    await unlock(page);
    await page.getByLabel("your name").fill("june park");
    await page.getByLabel("shop or business").fill("still life coffee");
    await page.getByLabel("email").fill("june@stilllife.coffee");
    await page.getByRole("button", { name: /to the order/i }).click();

    const next = page.getByRole("button", { name: /to the vision/i });
    await addLine(page, "mug, with handle", 6, "12 oz");
    await expect(page.getByText(/4 more to reach ten/i).first()).toBeAttached();
    await expect(next).toBeDisabled();

    await addLine(page, "cup", 4, "8 oz");
    await addLine(page, "jewelry dish", 3);
    await expect(next).toBeEnabled();
    await next.click();

    await page
      .getByLabel("anything else i should know")
      .fill("for the counter");
    await expect(page.getByText(/by [a-z]{3} \d{1,2}/i)).toBeVisible();
    await page.getByRole("button", { name: /read it back/i }).click();

    const send = page.getByRole("button", { name: /send to alicia/i });
    await expect(send).toBeDisabled();
    await page.getByText(/everything looks right/i).click();
    await send.click();

    await expect(
      page.getByRole("heading", { name: /thank you — i got your order/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/thirteen pieces, estimated for [a-z]{3} \d{1,2}/i),
    ).toBeVisible();
  });
});
