import { writeFile } from "node:fs/promises";

// Original sound design, not a recording of a medical device. A small motor's
// harmonics and vibration sit under filtered airflow, with slow variations.
const sampleRate = 48000;
const seconds = 24;
const samples = new Float32Array(sampleRate * seconds);
let seed = 0xc02a;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 2 - 1;
};
const lowCut = Math.exp((-2 * Math.PI * 220) / sampleRate);
const highCut = Math.exp((-2 * Math.PI * 2400) / sampleRate);
let low = 0;
let high = 0;
// Warm the airflow filters before keeping any samples.
for (let i = 0; i < sampleRate; i++) {
  const noise = random();
  low = lowCut * low + (1 - lowCut) * noise;
  high = highCut * high + (1 - highCut) * noise;
}
let sum = 0;
for (let i = 0; i < samples.length; i++) {
  const t = i / sampleRate;
  const phase = 2 * Math.PI * 50 * t;
  const drift = 1 + 0.025 * Math.sin((2 * Math.PI * t) / 8);
  const vibration = 1 + 0.06 * Math.sin(2 * Math.PI * 25 * t);
  const motor =
    0.07 * Math.sin(phase) +
    0.1 * Math.sin(2 * phase + 0.3) +
    0.045 * Math.sin(3 * phase + 0.8) +
    0.025 * Math.sin(4 * phase + 1.1) +
    0.012 * Math.sin(6 * phase + 0.4);
  const noise = random();
  low = lowCut * low + (1 - lowCut) * noise;
  high = highCut * high + (1 - highCut) * noise;
  samples[i] = drift * (motor * vibration + 0.22 * (high - low));
  sum += samples[i];
}
const mean = sum / samples.length;
let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample - mean));

// Mono PCM WAV, reproducible and universally decodable by Web Audio.
const wav = Buffer.alloc(44 + samples.length * 2);
wav.write("RIFF", 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(samples.length * 2, 40);
for (let i = 0; i < samples.length; i++) {
  wav.writeInt16LE(Math.round(((samples[i] - mean) / peak) * 0.45 * 32767), 44 + i * 2);
}
await writeFile(new URL("../public/audio/nebulizer.wav", import.meta.url), wav);
console.log(`Original nebulizer sound: ${seconds}s, ${wav.length} bytes.`);
