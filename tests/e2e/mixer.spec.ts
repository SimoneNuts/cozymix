import { test, expect } from "@playwright/test";
import {
  contextState,
  expectAudible,
  expectSilent,
  openApp,
  pad,
  playButton,
  soundButton,
} from "./helpers";

test("tapping a sound plays it; its slider sets the level; pause stops the audio", async ({ page }) => {
  const problems = await openApp(page);
  await expect(playButton(page)).toBeDisabled();
  expect(await contextState(page)).toBe("none");

  await soundButton(page, "Rain").click();
  await expect(soundButton(page, "Rain")).toHaveAttribute("aria-pressed", "true");
  await expect(pad(page, "rain")).toHaveAttribute("data-state", "playing");
  await expectAudible(page);
  await expect(page.locator(".dock-status")).toHaveText("Playing · 1 sound");

  await page.getByRole("slider", { name: "Rain volume", exact: true }).fill("20");
  await expect(pad(page, "rain").locator("output")).toHaveText("20%");

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(pad(page, "rain")).toHaveAttribute("data-state", "paused");
  await expectSilent(page);

  await page.getByRole("button", { name: "Play" }).click();
  await expectAudible(page);
  expect(problems).toEqual([]);
});

test("moving the slider of a sound that is off turns it on", async ({ page }) => {
  await openApp(page);
  await page.getByRole("slider", { name: "Waves volume" }).fill("40");
  await expect(soundButton(page, "Waves")).toHaveAttribute("aria-pressed", "true");
  await expect(pad(page, "waves")).toHaveAttribute("data-state", "playing");
  await expectAudible(page);

  await page.getByRole("slider", { name: "Waves volume" }).fill("0");
  await expect(soundButton(page, "Waves")).toHaveAttribute("aria-pressed", "false");
  await expect(playButton(page)).toBeDisabled();
  await expectSilent(page);
});

test("the mix is remembered across reloads, but never starts by itself", async ({ page }) => {
  await openApp(page);
  await soundButton(page, "Fireplace").click();
  await soundButton(page, "Café").click();
  await page.getByRole("slider", { name: "Overall volume" }).fill("35");
  await expectAudible(page);

  await page.reload();
  await expect(soundButton(page, "Fireplace")).toHaveAttribute("aria-pressed", "true");
  await expect(soundButton(page, "Café")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("slider", { name: "Overall volume" })).toHaveValue("35");
  await expect(page.locator(".dock-status")).toHaveText("Paused · 2 sounds");
  expect(await contextState(page)).toBe("none");

  await page.keyboard.press("Space");
  await expectAudible(page);
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.keyboard.press("Space");
  await expectSilent(page);
});

test("scenes replace the mix and can be undone; everything can be turned off", async ({ page }) => {
  await openApp(page);
  await soundButton(page, "Brown noise").click();
  const storm = page.getByRole("button", { name: "Storm", exact: true });
  await storm.click();
  await expect(storm).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#mix-title")).toHaveText("Storm");
  await expect(page.locator(".pad-toggle[aria-pressed=true]")).toHaveCount(3);
  await expect(soundButton(page, "Brown noise")).toHaveAttribute("aria-pressed", "false");
  await expectAudible(page);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".pad-toggle[aria-pressed=true]")).toHaveCount(1);
  await expect(soundButton(page, "Brown noise")).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Turn everything off" }).click();
  await expect(page.locator(".pad-toggle[aria-pressed=true]")).toHaveCount(0);
  await expect(playButton(page)).toBeDisabled();
  await expectSilent(page);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(soundButton(page, "Brown noise")).toHaveAttribute("aria-pressed", "true");
});

test("saving, loading and deleting your own mixes", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: "Cabin", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Save this mix" });
  await expect(dialog).toBeVisible();
  const name = dialog.getByRole("textbox", { name: "Name" });
  await expect(name).toBeFocused();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Give your mix a name.");
  await name.fill("Snowed in");
  await name.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Load Snowed in" })).toBeVisible();

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await dialog.getByRole("textbox", { name: "Name" }).fill("snowed IN");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("You already have a mix with this name.");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  // Change the mix, then load the saved one back.
  await soundButton(page, "Fireplace").click();
  await page.getByRole("button", { name: "Load Snowed in" }).click();
  await expect(page.locator("#mix-title")).toHaveText("Cabin");
  await expect(soundButton(page, "Fireplace")).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await page.getByRole("button", { name: "Delete Snowed in" }).click();
  await expect(page.getByRole("button", { name: "Load Snowed in" })).toHaveCount(0);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: "Load Snowed in" })).toBeVisible();
});

test("a failed download says so and can be retried", async ({ page }) => {
  let fail = true;
  await page.route("**/audio/train.mp3", (route) => (fail ? route.abort() : route.continue()));
  await openApp(page);
  await soundButton(page, "Train").click();
  await expect(pad(page, "train")).toHaveAttribute("data-state", "error");
  await expect(pad(page, "train")).toContainText("Couldn’t load");
  fail = false;
  await page.getByRole("button", { name: "Try loading Train again" }).click();
  await expect(pad(page, "train")).toHaveAttribute("data-state", "playing");
  await expectAudible(page);
});
