import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // In local dev this environment has a mismatched Playwright/browser version.
          // Override the executable path so tests can run. In CI, Playwright installs
          // the correct browser version so no override is needed.
          executablePath: process.env.CI
            ? undefined
            : "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
  ],

  webServer: {
    // Use next dev directly — pnpm dev uses vercel dev which isn't available in CI.
    command: "pnpm exec next dev --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
