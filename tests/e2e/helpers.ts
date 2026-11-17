import { expect, test, type Page } from "@playwright/test";

type EngineProbe = {
  __cozymixEngine?: { ctx: AudioContext | null; level: () => number };
};

/**
 * Opens the app and collects page and console errors for the test to check.
 * Tests that need real sound are skipped in browser builds without Web Audio
 * (Playwright's WebKit on Windows); Safari itself has it.
 */
export async function openApp(page: Page, path = "./", { audio = true } = {}) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  await page.goto(path);
  // The app renders in the browser; allow for a slow first script load.
  await expect(page.locator(".pads")).toBeVisible({ timeout: 15_000 });
  if (audio) {
    const hasWebAudio = await page.evaluate(
      () => "AudioContext" in window || "webkitAudioContext" in window,
    );
    test.skip(!hasWebAudio, "this browser build has no Web Audio");
  }
  return problems;
}

/** The AudioContext state, or "none" before any sound was ever started. */
export function contextState(page: Page) {
  return page.evaluate(
    () => (window as EngineProbe).__cozymixEngine?.ctx?.state ?? "none",
  );
}

/** Real output loudness, measured by the engine's analyser. */
export function outputLevel(page: Page) {
  return page.evaluate(() => (window as EngineProbe).__cozymixEngine?.level() ?? 0);
}

export async function expectAudible(page: Page) {
  // Check the clock first, so a missing audio device reads as such in the report.
  await expect
    .poll(() => contextState(page), { message: "the AudioContext should be running" })
    .toBe("running");
  await expect
    .poll(() => outputLevel(page), { message: "the engine should output sound", timeout: 15_000 })
    .toBeGreaterThan(0.0005);
}

export async function expectSilent(page: Page) {
  await expect.poll(() => contextState(page)).not.toBe("running");
}

export const pad = (page: Page, id: string) => page.locator(`.pad[data-sound="${id}"]`);
export const soundButton = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
export const playButton = (page: Page) => page.locator(".play");

export async function noHorizontalScroll(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(0);
}
