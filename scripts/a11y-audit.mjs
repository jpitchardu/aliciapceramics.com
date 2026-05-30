import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const SITE = "https://www.aliciapceramics.com";
const COOKIE = {
  name: "gate_bypass",
  value: "1",
  domain: "www.aliciapceramics.com",
  path: "/",
};

const PAGES = [
  { name: "home (mobile)", url: "/", w: 390, h: 844 },
  { name: "home (desktop)", url: "/", w: 1440, h: 900 },
  { name: "shop (mobile)", url: "/shop", w: 390, h: 844 },
  { name: "shop (desktop)", url: "/shop", w: 1440, h: 900 },
  {
    name: "detail (mobile)",
    url: "/shop/MDCV2BMWYMDYJO6DMQKNS2HA",
    w: 390,
    h: 844,
  },
  {
    name: "detail (desktop)",
    url: "/shop/MDCV2BMWYMDYJO6DMQKNS2HA",
    w: 1440,
    h: 900,
  },
  { name: "cart (mobile)", url: "/cart", w: 390, h: 844 },
  { name: "order-confirmed", url: "/order-confirmed", w: 390, h: 844 },
];

const ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

const browser = await chromium.launch({
  executablePath:
    "/home/jpitch/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome",
});

const allResults = [];

for (const { name, url, w, h } of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addCookies([COOKIE]);
  const page = await ctx.newPage();
  await page.goto(SITE + url, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "best-practice"])
    .analyze();
  const violations = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(" ")),
  }));
  await ctx.close();
  if (violations.length) allResults.push({ name, url, violations });
}

await browser.close();

console.log("\n╔══════════════════════════════════════╗");
console.log("║      A11Y AUDIT RESULTS              ║");
console.log("╚══════════════════════════════════════╝\n");

for (const { name, violations } of allResults) {
  console.log(`\n▶ ${name}`);
  const sorted = [...violations].sort(
    (a, b) => (ORDER[a.impact] ?? 4) - (ORDER[b.impact] ?? 4),
  );
  for (const v of sorted) {
    const badge = `[${(v.impact || "?").toUpperCase()}]`.padEnd(12);
    console.log(`  ${badge} ${v.id}`);
    console.log(`             ${v.help}`);
    if (v.nodes.length <= 3) v.nodes.forEach((n) => console.log(`             → ${n}`));
    else console.log(`             → ${v.nodes.length} elements`);
  }
}

const unique = [
  ...new Map(
    allResults.flatMap((p) => p.violations).map((v) => [v.id, v]),
  ).values(),
];
const c = (impact) => unique.filter((v) => v.impact === impact).length;
console.log(`\n${"─".repeat(50)}`);
console.log(
  `SUMMARY: ${unique.length} unique violations — critical:${c("critical")} serious:${c("serious")} moderate:${c("moderate")} minor:${c("minor")}`,
);
console.log(`Pages audited: ${PAGES.length} (${allResults.length} had issues)`);
