import { test, expect, type Page } from "@playwright/test";
import { expectAudible, openApp, soundButton } from "./helpers";

test.use({ serviceWorkers: "allow" });
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "offline emulation reaches service workers in Chromium only",
);

const pad = (page: Page, id: string) => page.locator(`.pad[data-sound="${id}"]`);

/** Opens About and waits until the worker has kept the app itself. */
async function waitForOfflineApp(page: Page) {
  await page.getByRole("button", { name: "About and settings" }).click();
  await expect(page.locator(".offline-status")).toHaveText("The app opens without a connection.", {
    timeout: 30_000,
  });
}

test("the app opens offline, and a sound played once keeps working without a connection", async ({
  page,
  context,
}) => {
  await openApp(page);
  await waitForOfflineApp(page);
  // Nothing is downloaded up front: recordings are kept only once played.
  await expect(page.locator(".offline-sounds")).toContainText("0 of 12 sounds are saved");
  await page.keyboard.press("Escape");

  await soundButton(page, "Fireplace").click();
  await expect(pad(page, "fireplace")).toHaveAttribute("data-state", "playing");
  await page.getByRole("button", { name: "About and settings" }).click();
  await expect(page.locator(".offline-sounds")).toContainText("1 of 12 sounds are saved");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pause" }).click();

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".pads")).toBeVisible();
  // The mix comes back paused with the fireplace on. The played recording and
  // a generated sound work; one never played cannot.
  await expect(soundButton(page, "Fireplace")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Play" }).click();
  await soundButton(page, "Brown noise").click();
  await expect(pad(page, "fireplace")).toHaveAttribute("data-state", "playing");
  await expect(pad(page, "brown")).toHaveAttribute("data-state", "playing");
  await expectAudible(page);
  await soundButton(page, "Train").click();
  await expect(pad(page, "train")).toHaveAttribute("data-state", "error");
  await context.setOffline(false);
});

test("Download all sounds keeps every recording for offline use", async ({ page, context }) => {
  await openApp(page);
  await waitForOfflineApp(page);
  await page.getByRole("button", { name: /^Download all sounds \(\d+ MB\)$/ }).click();
  await expect(page.locator(".offline-sounds")).toHaveText("All 12 sounds are saved for offline use.", {
    timeout: 60_000,
  });
  await expect(page.getByRole("button", { name: /Download all sounds/ })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".pads")).toBeVisible();
  await soundButton(page, "Train").click();
  await soundButton(page, "Waves").click();
  await expect(pad(page, "train")).toHaveAttribute("data-state", "playing");
  await expect(pad(page, "waves")).toHaveAttribute("data-state", "playing");
  await expectAudible(page);
  await context.setOffline(false);
});
