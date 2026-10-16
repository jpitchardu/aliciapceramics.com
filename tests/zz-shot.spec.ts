import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const [n, u] of [["booked","/classes/create-your-own-mug/booked"],["away","/classes/private?place=yours"],["list","/classes"]]) {
  test(n, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(u);
    await page.screenshot({ path: "/tmp/claude-0/-home-claude-repo/626cbf4a-1280-596c-a0b3-f693772bfebf/scratchpad/" + n + ".png", fullPage: true });
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.map(v => v.id)).toEqual([]);
  });
}
