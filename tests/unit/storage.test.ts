import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyMix, setMaster, setVolume } from "../../src/lib/mix.ts";
import {
  MAX_SAVED,
  cleanName,
  nameProblem,
  parseMix,
  parseSaved,
  serializeMix,
  serializeSaved,
  type SavedMix,
} from "../../src/lib/storage.ts";
import { decodeShare, encodeShare } from "../../src/lib/share.ts";

test("a stored mix round-trips", () => {
  const mix = setMaster(setVolume(emptyMix(), "train", 0.33), 0.7);
  assert.deepEqual(parseMix(serializeMix(mix)), mix);
});

test("unreadable or hostile stored mixes fall back to defaults", () => {
  for (const raw of [null, "", "{", "null", "[]", '"x"', "42"]) {
    assert.deepEqual(parseMix(raw), emptyMix(), String(raw));
  }
  const odd = parseMix(
    JSON.stringify({
      master: 9,
      tracks: { rain: { on: true, volume: -3 }, ghost: { on: true, volume: 1 }, wind: "loud" },
    }),
  );
  assert.equal(odd.master, 1);
  assert.deepEqual(odd.tracks.rain, { on: true, volume: 0 });
  assert.equal("ghost" in odd.tracks, false);
  assert.deepEqual(odd.tracks.wind, emptyMix().tracks.wind);
});

test("saved mixes are validated, de-duplicated and capped", () => {
  const good: SavedMix = { id: "a", name: "  Sunday   morning ", levels: { rain: 0.5 } };
  const entries = [
    good,
    { ...good }, // same id
    { id: "b", name: "", levels: { rain: 0.5 } },
    { id: "c", name: "No sounds", levels: { ghost: 1 } },
    { id: "d", name: "Bad levels", levels: "x" },
    null,
    ...Array.from({ length: 40 }, (_, i) => ({ id: `n${i}`, name: `Mix ${i}`, levels: { wind: 2 } })),
  ];
  const parsed = parseSaved(JSON.stringify(entries));
  assert.equal(parsed.length, MAX_SAVED);
  assert.deepEqual(parsed[0], { id: "a", name: "Sunday morning", levels: { rain: 0.5 } });
  assert.equal(parsed[1].levels.wind, 1);
  assert.deepEqual(parseSaved(serializeSaved(parsed)), parsed);
  assert.deepEqual(parseSaved("{"), []);
});

test("names: empty, duplicate (any case) and full are refused", () => {
  const saved: SavedMix[] = [{ id: "a", name: "Night", levels: { rain: 1 } }];
  assert.equal(nameProblem("   ", saved), "empty");
  assert.equal(nameProblem(" night ", saved), "taken");
  assert.equal(nameProblem("Morning", saved), undefined);
  const full = Array.from({ length: MAX_SAVED }, (_, i) => ({ id: `${i}`, name: `m${i}`, levels: {} }));
  assert.equal(nameProblem("Another", full), "full");
  assert.equal(cleanName("x".repeat(80)).length, 40);
});

test("share links round-trip and stay readable", () => {
  const hash = encodeShare({ wind: 0.15, rain: 0.65 });
  assert.equal(hash, "#mix=rain.65,wind.15");
  assert.deepEqual(decodeShare(hash), { levels: { rain: 0.65, wind: 0.15 }, skipped: 0 });
  assert.equal(encodeShare({}), "");
});

test("share links skip unknown or malformed entries and clamp levels", () => {
  assert.deepEqual(decodeShare("#mix=rain.250,ghost.20,wind.x,,rain.10,cafe.0"), {
    levels: { rain: 1 },
    skipped: 3,
  });
  assert.equal(decodeShare("#mix=ghost.20"), undefined);
  // Pink noise was removed: old links still open, without it.
  assert.deepEqual(decodeShare("#mix=brown.50,pink.12,rain.20"), {
    levels: { brown: 0.5, rain: 0.2 },
    skipped: 1,
  });
  assert.equal(decodeShare("#other"), undefined);
  assert.equal(decodeShare(""), undefined);
});
