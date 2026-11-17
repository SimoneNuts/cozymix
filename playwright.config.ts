import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Test the exported site at the base path it was built for (see scripts/postbuild.mjs).
const base = existsSync("out/.base-path") ? readFileSync("out/.base-path", "utf8").trim() : "";

/**
 * Browser tests run against the static export in out/ (`npm run build` first),
 * served the way GitHub Pages serves it.
 * Audio is real Web Audio: tests read the engine's output level.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "artifacts/e2e",
  use: {
    baseURL: `http://127.0.0.1:3100${base}/`,
    locale: "en-US",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "node scripts/serve.mjs 3100",
    url: `http://127.0.0.1:3100${base}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
