import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    channel: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174",
    env: {
      VITE_API_URL: "http://localhost:5000",
      VITE_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    },
    reuseExistingServer: false,
  },
});
