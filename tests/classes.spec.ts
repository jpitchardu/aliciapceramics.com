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
    await page.getByRole("button", { name: /continue to square/ }).click();
    await expect(page.getByText(/nothing was charged/)).toBeVisible();
  });

  test("a sold-out class takes a wait-list name instead", async ({ page }) => {
    await page.goto("/classes/pinch-and-slab");
    await expect(page.getByRole("button", { name: /book/ })).toHaveCount(0);
    await page.getByLabel("your name").fill("marisol reyes");
    await page.getByLabel("your email").fill("marisol@example.com");
    await page.getByRole("button", { name: "join the wait-list" }).click();
    await expect(page.getByText(/you're on the list, marisol/)).toBeVisible();
  });

  test("a private request away from the studio drops the wheel", async ({
    page,
  }) => {
    await page.goto("/classes/private");
    await page.getByRole("button", { name: /a place of your own/ }).click();
    await expect(
      page.getByRole("button", { name: /at the wheel/ }),
    ).toBeDisabled();
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(
      page.getByText("roughly where are we coming to?"),
    ).toBeVisible();

    await page
      .getByLabel("where are we coming to")
      .fill("a backyard in oak cliff");
    await page
      .getByLabel("or a date of your own")
      .fill("any saturday in december");
    await page.getByLabel("how many of you").fill("14");
    await page.getByLabel("your name").fill("marisol reyes");
    await page.getByLabel("how to reach you").fill("marisol@example.com");
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(
      page.getByRole("heading", { name: "that's with me — thank you." }),
    ).toBeVisible();
    await expect(page.getByText("a backyard in oak cliff")).toBeVisible();
  });

  test("the studio holds ten", async ({ page }) => {
    await page.goto("/classes/private");
    await page.getByLabel("how many of you").fill("14");
    await page.getByRole("button", { name: /send this to alicia/ }).click();
    await expect(page.getByText(/the studio holds ten/)).toHaveCount(2);
  });
});
