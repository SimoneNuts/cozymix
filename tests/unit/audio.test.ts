import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOP_SECONDS, generate, noise, seamless } from "../../src/audio/dsp.ts";
import type { Generator } from "../../src/lib/catalog.ts";

const RATE = 8000; // low rate keeps the tests fast; the maths is the same

function stats(data: Float32Array) {
  let sum = 0;
  let squares = 0;
  let peak = 0;
  let step = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    squares += data[i] ** 2;
    peak = Math.max(peak, Math.abs(data[i]));
    if (i) step += Math.abs(data[i] - data[i - 1]);
  }
  return {
    mean: sum / data.length,
    rms: Math.sqrt(squares / data.length),
    peak,
    meanStep: step / (data.length - 1),
  };
}

test("noise is seeded, repeatable and inside [-1, 1)", () => {
  const a = noise(42);
  const b = noise(42);
  const values = Array.from({ length: 10_000 }, () => a());
  assert.deepEqual(values.slice(0, 5), Array.from({ length: 5 }, () => b()));
  assert.ok(values.every((v) => v >= -1 && v < 1));
  assert.notDeepEqual(values.slice(0, 5), Array.from({ length: 5 }, noise(43)));
});

test("seamless() removes the click where a loop wraps around", () => {
  // A sine that does not complete a whole cycle: a raw loop would jump.
  const raw = Float32Array.from({ length: 10_000 }, (_, i) => Math.sin(i * 0.0137));
  const rawJump = Math.abs(raw[raw.length - 1] - raw[0]);
  const loop = seamless(raw, 2000);
  assert.equal(loop.length, 8000);
  const jump = Math.abs(loop[loop.length - 1] - loop[0]);
  assert.ok(rawJump > 0.5, "the test signal should have a seam");
  assert.ok(jump < 0.03, `seam jump ${jump}`);
  assert.equal(loop[5000], raw[5000], "the middle is untouched");
});

test("seamless() leaves too-short input alone", () => {
  const short = new Float32Array([1, 2, 3]);
  assert.deepEqual(seamless(short, 5), short);
});

for (const kind of ["brown", "pink", "waves", "wind"] as Generator[]) {
  test(`${kind}: stereo, clean levels, no DC, and a seamless loop`, () => {
    const channels = generate(kind, RATE, 3);
    assert.equal(channels.length, 2);
    for (const channel of channels) {
      assert.equal(channel.length, LOOP_SECONDS[kind] * RATE);
      assert.ok(channel.every(Number.isFinite));
      const s = stats(channel);
      assert.ok(s.peak <= 0.9 + 1e-6, `peak ${s.peak}`);
      assert.ok(s.rms > 0.05 && s.rms < 0.25, `rms ${s.rms}`);
      assert.ok(Math.abs(s.mean) < 0.01, `dc ${s.mean}`);
      const seam = Math.abs(channel[channel.length - 1] - channel[0]);
      assert.ok(seam < s.meanStep * 8 + 0.02, `seam ${seam} vs typical step ${s.meanStep}`);
    }
    // The ears hear different noise, which makes it feel wide.
    assert.notDeepEqual(channels[0].slice(0, 100), channels[1].slice(0, 100));
  });
}

test("generation is deterministic for a seed", () => {
  const [a] = generate("wind", RATE, 7);
  const [b] = generate("wind", RATE, 7);
  assert.deepEqual(a.slice(1000, 1100), b.slice(1000, 1100));
});
