import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { expectAudible, noHorizontalScroll, openApp, soundButton } from "./helpers";

const axe = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);

for (const scheme of ["dark", "light"] as const) {
  test(`no accessibility violations (${scheme}), page and every sheet`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await openApp(page);
    await page.getByRole("button", { name: "Storm", exact: true }).click();
    await page.getByRole("button", { name: "Pause" }).click();
    await page.locator(".toast").getByRole("button", { name: "Dismiss" }).click();
    expect((await axe(page).analyze()).violations).toEqual([]);

    for (const [opener, title] of [
      ["Sleep timer", "Sleep timer"],
      ["Save", "Save this mix"],
      ["About and settings", "About CozyMix"],
    ]) {
      await page.getByRole("button", { name: opener, exact: true }).click();
      const dialog = page.getByRole("dialog", { name: title });
      await expect(dialog).toBeVisible();
      expect((await axe(page).include(".sheet[open]").analyze()).violations, title).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      // Focus goes back to the button that opened the sheet.
      await expect(page.getByRole("button", { name: opener, exact: true })).toBeFocused();
    }
  });
}

test("layouts fit from 320px phones to wide desktops", async ({ page }) => {
  await openApp(page, "./", { audio: false });
  await page.getByRole("button", { name: "Cabin", exact: true }).click();
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await noHorizontalScroll(page);
    // The player stays on screen, with Play inside the viewport.
    const box = await page.locator(".play").boundingBox();
    expect(box && box.y + box.height <= 800, `play visible at ${width}`).toBe(true);
  }
});

test("touch targets are at least 44px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openApp(page, "./", { audio: false });
  await soundButton(page, "Rain").click();
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("button, input, [role=button]")]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width < 43.5 || box.height < 43.5)
      .map(({ el, box }) => `${el.className || el.tagName} ${box.width}x${box.height}`),
  );
  expect(small).toEqual([]);
});

test("keyboard: every sound is reachable and adjustable", async ({ page }) => {
  await openApp(page);
  const toggle = soundButton(page, "Wind");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("slider", { name: "Wind volume" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("slider", { name: "Wind volume" })).toHaveValue("36");
  await expectAudible(page);
});
