import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { audioFiles, scenes, sounds, isSoundId } from "../../src/lib/catalog.ts";
import {
  activeIds,
  clampLevel,
  clearAll,
  emptyMix,
  fromLevels,
  levelsOf,
  matchingScene,
  sceneMix,
  setMaster,
  setVolume,
  toggle,
} from "../../src/lib/mix.ts";

test("catalog ids are unique and every recording exists on disk", () => {
  assert.equal(new Set(sounds.map((s) => s.id)).size, sounds.length);
  for (const file of audioFiles) assert.ok(existsSync(`public${file}`), file);
  for (const sound of sounds) {
    assert.ok(sound.defaultVolume > 0 && sound.defaultVolume <= 1, sound.id);
    assert.ok(sound.hue >= 0 && sound.hue < 360, sound.id);
    if (sound.credit.license === "CC0 1.0") assert.match(sound.credit.url ?? "", /^https:\/\/freesound\.org\//);
  }
});

test("the offline worker caches exactly the catalog's recordings", () => {
  const worker = readFileSync("public/sw.js", "utf8");
  const list = /const AUDIO = \[([^\]]*)\]/.exec(worker)?.[1] ?? "";
  const cached = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...cached].sort(), [...audioFiles].sort());
});

test("scenes only use known sounds, at audible levels", () => {
  assert.equal(new Set(scenes.map((s) => s.id)).size, scenes.length);
  for (const scene of scenes) {
    const entries = Object.entries(scene.levels);
    assert.ok(entries.length >= 1, scene.id);
    for (const [id, level] of entries) {
      assert.ok(isSoundId(id), `${scene.id} uses unknown ${id}`);
      assert.ok(level > 0 && level <= 1, `${scene.id}/${id}`);
    }
  }
});

test("toggle turns a sound on at its remembered volume, and off again", () => {
  const on = toggle(emptyMix(), "rain");
  assert.deepEqual(activeIds(on), ["rain"]);
  assert.equal(on.tracks.rain.volume, 0.6);
  const off = toggle(on, "rain");
  assert.deepEqual(activeIds(off), []);
  assert.equal(off.tracks.rain.volume, 0.6);
});

test("toggling on a sound whose slider is at zero gives it a sensible level", () => {
  const silent = setVolume(emptyMix(), "rain", 0);
  assert.equal(toggle(silent, "rain").tracks.rain.volume, 0.5);
});

test("moving a slider above zero turns the sound on; to zero turns it off", () => {
  const up = setVolume(emptyMix(), "fireplace", 0.3);
  assert.deepEqual(up.tracks.fireplace, { on: true, volume: 0.3 });
  const down = setVolume(up, "fireplace", 0);
  assert.deepEqual(down.tracks.fireplace, { on: false, volume: 0 });
});

test("levels are clamped and rounded to whole percent", () => {
  assert.equal(clampLevel(0.555), 0.56);
  assert.equal(clampLevel(4), 1);
  assert.equal(clampLevel(-1), 0);
  assert.equal(clampLevel(Number.NaN), 0);
  assert.equal(setMaster(emptyMix(), 1.7).master, 1);
});

test("functions never mutate their input", () => {
  const mix = emptyMix();
  const snapshot = JSON.stringify(mix);
  toggle(mix, "rain");
  setVolume(mix, "train", 0.2);
  clearAll(toggle(mix, "rain"));
  sceneMix(scenes[0], mix);
  assert.equal(JSON.stringify(mix), snapshot);
});

test("clearing turns everything off but keeps slider positions", () => {
  const mix = setVolume(setVolume(emptyMix(), "rain", 0.9), "cafe", 0.2);
  const cleared = clearAll(mix);
  assert.deepEqual(activeIds(cleared), []);
  assert.equal(cleared.tracks.rain.volume, 0.9);
  assert.equal(cleared.tracks.cafe.volume, 0.2);
});

test("a scene replaces the mix, keeps the master, and is recognised afterwards", () => {
  const base = setMaster(toggle(emptyMix(), "pink"), 0.4);
  const storm = scenes.find((s) => s.id === "storm")!;
  const mix = sceneMix(storm, base);
  assert.equal(mix.master, 0.4);
  assert.deepEqual(levelsOf(mix), storm.levels);
  assert.equal(matchingScene(mix)?.id, "storm");
  assert.equal(matchingScene(setVolume(mix, "rain", 0.1)), undefined);
  assert.equal(matchingScene(emptyMix()), undefined);
});

test("fromLevels ignores sounds at zero", () => {
  const mix = fromLevels({ rain: 0, wind: 0.4 }, emptyMix());
  assert.deepEqual(activeIds(mix), ["wind"]);
});
