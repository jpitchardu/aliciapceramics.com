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
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
            "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        },
      },
    },
  ],

  webServer: {
    command: "pnpm next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      GATE_BYPASS_KEY: process.env.GATE_BYPASS_KEY ?? "test-bypass",
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN ?? "fake",
      SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT ?? "sandbox",
    },
  },
});
