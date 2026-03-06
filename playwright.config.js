import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
