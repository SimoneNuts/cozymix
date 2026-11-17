/**
 * Plain sample math: seeded randomness, seamless loops and the sounds
 * CozyMix synthesizes instead of downloading. Works on Float32Arrays only, so
 * Node tests can check it without a browser.
 *
 * Pure module: no React, no DOM, relative imports only.
 */
import type { Generator } from "../lib/catalog.ts";

/** Small, fast, seeded PRNG (mulberry32) returning values in [-1, 1). */
export function noise(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}

/**
 * Turns a clip into a loop with no audible seam. The last `fade` samples are
 * blended into the first ones with an equal-power crossfade, and the result is
 * that many samples shorter. Played on repeat, the end runs straight into the
 * start.
 */
export function seamless(data: Float32Array, fade: number): Float32Array {
  const length = data.length - fade;
  if (fade <= 0 || length <= fade) return data.slice();
  const out = data.slice(0, length);
  for (let i = 0; i < fade; i++) {
    const x = (i / fade) * (Math.PI / 2);
    out[i] = data[i] * Math.sin(x) + data[length + i] * Math.cos(x);
  }
  return out;
}

/** Scales a set of channels to a target loudness without clipping. */
export function normalize(channels: Float32Array[], targetRms: number, ceiling = 0.9) {
  let sum = 0;
  let count = 0;
  let peak = 0;
  for (const channel of channels) {
    for (const value of channel) {
      sum += value * value;
      peak = Math.max(peak, Math.abs(value));
    }
    count += channel.length;
  }
  const rms = Math.sqrt(sum / Math.max(1, count));
  if (rms === 0) return;
  const gain = Math.min(targetRms / rms, ceiling / peak);
  for (const channel of channels) for (let i = 0; i < channel.length; i++) channel[i] *= gain;
}

/** Removes any constant offset so the speaker cone sits centred. */
export function removeDc(channel: Float32Array) {
  let mean = 0;
  for (const value of channel) mean += value;
  mean /= channel.length || 1;
  for (let i = 0; i < channel.length; i++) channel[i] -= mean;
}

export const LOOP_SECONDS: Record<Generator, number> = {
  brown: 36,
};
const FADE_SECONDS = 2;

type Voice = (index: number, t: number) => number;

/**
 * Renders one generated sound as stereo loop channels.
 * Envelopes repeat exactly every loop length, so the seam is invisible in
 * both the waveform and the swell of the sound.
 */
export function generate(kind: Generator, sampleRate: number, seed = 1): Float32Array[] {
  const loop = Math.round(LOOP_SECONDS[kind] * sampleRate);
  const fade = Math.round(FADE_SECONDS * sampleRate);
  const total = loop + fade;
  const period = loop / sampleRate;
  const channels = [0, 1].map((channel) => {
    const voice = makeVoice(kind, sampleRate, period, seed * 7919 + channel * 104729, channel);
    // Let filters settle before keeping anything.
    for (let i = 0; i < sampleRate; i++) voice(-1, 0);
    const data = new Float32Array(total);
    for (let i = 0; i < total; i++) data[i] = voice(i, i / sampleRate);
    removeDc(data);
    return seamless(data, fade);
  });
  normalize(channels, 0.16);
  return channels;
}

function makeVoice(
  kind: Generator,
  sampleRate: number,
  period: number,
  seed: number,
  channel: number,
): Voice {
  const random = noise(seed);
  const tau = Math.PI * 2;
  switch (kind) {
    case "brown": {
      // Integrated white noise (6 dB per octave), shaped to sound deep and
      // soft rather than hissy: a two-pole low-pass rolls off everything
      // above a few hundred hertz, a high-pass trims the sub-bass that
      // speakers cannot play, and the low-pass drifts slowly so the sound
      // breathes instead of sitting still. Each ear drifts on its own phase.
      let level = 0;
      let soft = 0;
      let warm = 0;
      let floor = 0;
      let deep = 0;
      const leak = 1 - (tau * 70) / sampleRate;
      const kFloor = 1 - Math.exp((-tau * 40) / sampleRate);
      const phase = channel * 1.7;
      return (_, t) => {
        level = leak * level + 0.05 * random();
        const drift = 0.5 + 0.5 * Math.sin((tau * t * 3) / period + phase);
        const cutoff = 380 + 420 * drift;
        const k = 1 - Math.exp((-tau * cutoff) / sampleRate);
        soft += k * (level - soft);
        warm += k * (soft - warm);
        // Two gentle high-pass stages, so the low end stays round but does not
        // swallow the loudness on small speakers.
        floor += kFloor * (warm - floor);
        const trimmed = warm - floor;
        deep += kFloor * (trimmed - deep);
        const swell = 1 + 0.08 * Math.sin((tau * t * 4) / period + phase * 0.5);
        return (trimmed - deep) * swell;
      };
    }

  }
}
