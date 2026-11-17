import { test } from "node:test";
import assert from "node:assert/strict";
import { messages, pickLocale } from "../../src/lib/i18n.ts";
import { fadeLevel, formatRemaining } from "../../src/lib/timer.ts";

/** Flattens a dictionary into path → sample text, calling templates with sample values. */
function flatten(value: unknown, path = ""): Record<string, string> {
  if (typeof value === "string") return { [path]: value };
  if (typeof value === "function") return { [path]: String(value(2)) };
  return Object.assign(
    {},
    ...Object.entries(value as object).map(([key, v]) => flatten(v, path ? `${path}.${key}` : key)),
  );
}

test("Italian has every English string, and none is empty", () => {
  const en = flatten(messages.en);
  const it = flatten(messages.it);
  assert.deepEqual(Object.keys(it).sort(), Object.keys(en).sort());
  for (const [key, text] of Object.entries(it)) assert.ok(text.trim(), `it.${key} is empty`);
  for (const [key, text] of Object.entries(en)) assert.ok(text.trim(), `en.${key} is empty`);
});

test("plural templates read naturally", () => {
  assert.equal(messages.en.player.count(1), "1 sound");
  assert.equal(messages.it.player.count(3), "3 suoni");
  assert.equal(messages.it.share.skipped(1), "1 suono non è disponibile qui.");
});

test("locale: saved choice, then browser languages, then English", () => {
  assert.equal(pickLocale("it", ["en-US"]), "it");
  assert.equal(pickLocale(null, ["de-DE", "it-IT"]), "it");
  assert.equal(pickLocale("fr", ["EN-gb"]), "en");
  assert.equal(pickLocale(null, []), "en");
});

test("the sleep timer fades over the last 30 seconds", () => {
  assert.equal(fadeLevel(10 * 60_000), 1);
  assert.equal(fadeLevel(30_000), 1);
  assert.equal(fadeLevel(15_000), 0.5);
  assert.equal(fadeLevel(0), 0);
  assert.equal(fadeLevel(-5), 0);
});

test("remaining time is shown rounded up", () => {
  assert.equal(formatRemaining(15 * 60_000), "15:00");
  assert.equal(formatRemaining(61_001), "1:02");
  assert.equal(formatRemaining(500), "0:01");
  assert.equal(formatRemaining(-1), "0:00");
  assert.equal(formatRemaining(90 * 60_000), "1:30:00");
});
