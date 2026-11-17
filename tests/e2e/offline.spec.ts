import { test, expect } from "@playwright/test";
import { expectAudible, openApp, soundButton } from "./helpers";

test.use({ serviceWorkers: "allow" });

test("after one visit, the app and its recordings work without a connection", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "offline emulation reaches service workers in Chromium only");
  await openApp(page);
  await page.getByRole("button", { name: "About and settings" }).click();
  await expect(page.locator(".offline-status")).toHaveText("Ready to work without a connection.", {
    timeout: 30_000,
  });
  await page.keyboard.press("Escape");

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".pads")).toBeVisible();
  // A recording and a generated sound, both without network.
  await soundButton(page, "Fireplace").click();
  await soundButton(page, "Waves").click();
  await expect(page.locator('.pad[data-sound="fireplace"]')).toHaveAttribute("data-state", "playing");
  await expect(page.locator('.pad[data-sound="waves"]')).toHaveAttribute("data-state", "playing");
  await expectAudible(page);
  await context.setOffline(false);
});
