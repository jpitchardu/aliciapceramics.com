import { test, expect } from "@playwright/test";

/*
 * /classes — the booking preview. Sample classes, and nothing is charged or
 * sent: every button leads to its next screen and stops there.
 */

test.describe("classes preview", () => {
  test("lists the classes, soonest first, with a sold-out one", async ({
    page,
  }) => {
    await page.goto("/classes");
    const titles = await page
      .getByRole("heading", { level: 2 })
      .allInnerTexts();
    expect(titles.slice(0, 3)).toEqual([
      "glaze night",
      "create your own mug",
      "an evening at the wheel",
    ]);
    await expect(page.getByText("only 2 seats left")).toBeVisible();
    await expect(page.getByText(/sample classes/)).toBeVisible();
  });

  test("books seats up to what's left and hands off without charging", async ({
    page,
  }) => {
    await page.goto("/classes/create-your-own-mug");
    const more = page.getByRole("button", { name: "one more seat" });
    await more.click();
    await expect(more).toBeDisabled();
    await expect(page.getByText("$170")).toBeVisible();
    await page.getByRole("button", { name: "book 2 seats" }).click();
    await expect(
      page.getByRole("heading", { name: "off to square to pay." }),
    ).toBeVisible();
    // wait on the checkout call itself — on a cold dev server the route
    // compiles on first hit and outlasts the 5s assertion timeout
    const checkout = page.waitForResponse("**/api/classes/checkout");
    await page.getByRole("button", { name: /continue to square/ }).click();
    await checkout;
    await expect(page.getByText(/nothing was charged/)).toBeVisible();
  });

  test("each seat picks its own piece, and the total adds the upgrades", async ({
    page,
  }) => {
    await page.goto("/classes/an-evening-at-the-wheel");
    await page.getByRole("button", { name: "one more seat" }).click();
    await page.getByRole("button", { name: "one more seat" }).click();
    // seat 2 → mug (+$8), seat 3 → vase (+$15)
    const seat2 = page.getByRole("group", { name: /seat 2/ });
    await seat2.getByRole("button", { name: /a mug with a handle/ }).click();
    const seat3 = page.getByRole("group", { name: /seat 3/ });
    await seat3.getByRole("button", { name: /a small vase/ }).click();
    await expect(page.getByText("$308")).toBeVisible();
    await page.getByRole("button", { name: "book 3 seats" }).click();
    await expect(page).toHaveURL(
      /seats=3&pieces=sample-cup%2Csample-mug%2Csample-vase/,
    );
    await expect(page.getByText("1 × seat · a small vase")).toBeVisible();
    await expect(page.getByText("$308")).toBeVisible();
  });

  test("a 333 matcha collab orders a drink for every seat", async ({
    page,
  }) => {
    await page.goto("/classes/matcha-and-clay");
    await expect(page.getByText("who brings what")).toBeVisible();
    const book = page.getByRole("button", { name: "book 1 seat" });
    // no drink picked yet — can't book
    await expect(book).toBeDisabled();

    await page.getByRole("button", { name: "one more seat" }).click();
    const seat1 = page.getByRole("group", { name: "seat 1" });
    await seat1.getByRole("button", { name: "honey, i'm home" }).click();
    await seat1.getByRole("button", { name: "iced" }).click();
    await seat1.getByRole("button", { name: /oat milk/ }).click();
    const seat2 = page.getByRole("group", { name: "seat 2" });
    await seat2.getByRole("button", { name: "matcha latte" }).click();
    await seat2.getByRole("button", { name: "hot" }).click();
    // the plain matcha takes a syrup; seat 1's flavored one doesn't
    await expect(seat1.getByText("syrup (optional)")).toHaveCount(0);
    await seat2.getByRole("button", { name: /earl grey/ }).click();

    // the drinks are included: 2 × $55, nothing more
    await expect(page.getByText("$110")).toBeVisible();
    await page.getByRole("button", { name: "book 2 seats" }).click();
    await expect(
      page.getByText("seat 1 · iced honey, i'm home matcha · oat milk"),
    ).toBeVisible();
    await expect(
      page.getByText("seat 2 · hot matcha latte · cow milk · earl grey syrup"),
    ).toBeVisible();
    // the seats line and the total both read $110 — the drinks add nothing
    await expect(page.getByText("$110")).toHaveCount(2);
  });

  test("a drink off the menu goes back to the class", async ({ page }) => {
    await page.goto(
      "/classes/matcha-and-clay/checkout?seats=1&drinks=frappuccino.iced.oat.",
    );
    await expect(page).toHaveURL(/\/classes\/matcha-and-clay$/);
  });

  test("an edited link goes back to the class", async ({ page }) => {
    await page.goto(
      "/classes/an-evening-at-the-wheel/checkout?seats=1&pieces=not-a-piece",
    );
    await expect(page).toHaveURL(/\/classes\/an-evening-at-the-wheel$/);
  });

  test("a sold-out class points to instagram for the next one", async ({
    page,
  }) => {
    await page.goto("/classes/pinch-and-slab");
    await expect(page.getByRole("button", { name: /book/ })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "all 8 seats are taken." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /follow @aliciapceramics/ }),
    ).toHaveAttribute("href", "https://instagram.com/aliciapceramics");
  });

  test("a private request away from the studio is mug painting", async ({
    page,
  }) => {
    await page.goto("/classes/private");
    await page.getByRole("button", { name: /a place of your own/ }).click();
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(
      page.getByText("roughly where are we coming to?"),
    ).toBeVisible();

    await page
      .getByLabel("where are we coming to")
      .fill("a backyard in oak cliff");
    await page.getByRole("button", { name: /· evening/ }).click();
    await page.getByLabel("how many of you").fill("14");
    await page.getByLabel("your name").fill("marisol reyes");
    await page.getByLabel("your email").fill("marisol@example.com");
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(
      page.getByRole("heading", { name: "that's with me — thank you." }),
    ).toBeVisible();
    await expect(page.getByText("a backyard in oak cliff")).toBeVisible();
    await expect(page.getByText(/mug painting for 14/)).toBeVisible();
  });

  test("the studio holds ten", async ({ page }) => {
    await page.goto("/classes/private");
    await page.getByLabel("how many of you").fill("14");
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(page.getByText(/the studio holds ten/)).toHaveCount(2);
  });
});
