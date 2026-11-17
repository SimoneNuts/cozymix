import { test, expect } from "@playwright/test";
import { contextState, expectAudible, expectSilent, openApp, soundButton } from "./helpers";

test("a shared link loads the mix, skips unknown sounds and waits for Play", async ({ page }) => {
  const problems = await openApp(page, "./#mix=waves.50,wind.20,ghost.30");
  await expect(page.locator(".toast")).toContainText("Someone shared a mix with you");
  await expect(page.locator(".toast")).toContainText("1 sound isn’t available here.");
  expect(new URL(page.url()).hash).toBe("");
  expect(await contextState(page)).toBe("none");
  await expect(page.getByRole("slider", { name: "Waves volume" })).toHaveValue("50");
  await expect(page.getByRole("slider", { name: "Wind volume" })).toHaveValue("20");
  await page.getByRole("button", { name: "Play" }).click();
  await expectAudible(page);
  expect(problems).toEqual([]);
});

test("Share copies a link that recreates the mix", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openApp(page);
  await page.getByRole("button", { name: "Seaside", exact: true }).click();
  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.locator(".toast")).toContainText("Link copied");
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/#mix=wind\.20,waves\.65$/);
});

test("the sleep timer counts down on the wall clock, fades, then pauses", async ({ page }) => {
  await page.clock.install();
  await openApp(page);
  await page.getByRole("button", { name: "Night train", exact: true }).click();
  await expectAudible(page);

  await page.getByRole("button", { name: "Sleep timer" }).click();
  const dialog = page.getByRole("dialog", { name: "Sleep timer" });
  await dialog.getByRole("button", { name: "15 min" }).click();
  await expect(dialog.getByRole("button", { name: "15 min" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.locator(".timer-status")).toContainText("left · Ends at");
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(page.locator(".pill")).toHaveText(/1[45]:\d\d/);

  await page.clock.fastForward("14:45");
  await expect(page.locator(".dock-status")).toHaveText("Fading out…");
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.clock.fastForward("00:30");
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  await expect(page.locator(".toast")).toContainText("Sleep timer finished");
  await expect(page.locator(".pill")).toHaveText("Sleep timer");
  await expectSilent(page);
  await expect(soundButton(page, "Train")).toHaveAttribute("aria-pressed", "true");

  // Playing again is at full volume, not stuck at the faded level.
  await page.getByRole("button", { name: "Play" }).click();
  await expectAudible(page);
});

test("Italian browsers get Italian, and the choice is remembered", async ({ browser }) => {
  const context = await browser.newContext({ locale: "it-IT" });
  const page = await context.newPage();
  const problems = await openApp(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { name: "Suoni" })).toBeVisible();
  await page.getByRole("button", { name: "Pioggia", exact: true }).click();
  await expect(page.getByRole("slider", { name: "Volume Pioggia" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pausa" })).toBeVisible();

  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.getByRole("heading", { name: "Sounds" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "Rain", exact: true })).toBeVisible();
  expect(problems).toEqual([]);
  await context.close();
});

test("without Web Audio, a clear message and controls that still work", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined, configurable: true });
    Object.defineProperty(window, "webkitAudioContext", { value: undefined, configurable: true });
  });
  await openApp(page, "./", { audio: false });
  await expect(page.locator(".banner[role=alert]")).toContainText("can’t play sounds");
  await soundButton(page, "Rain").click();
  await expect(soundButton(page, "Rain")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Turn everything off" }).click();
  await expect(page.locator(".pad-toggle[aria-pressed=true]")).toHaveCount(0);
});
