// Draws the CozyMix app icons (a crescent moon on warm amber) as PNG files.
// No dependencies: shapes are rasterized with 4×4 supersampling and encoded
// with node:zlib. Run with `node scripts/make-icons.mjs`.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const amberTop = [255, 211, 161];
const amberBottom = [232, 137, 58];
const ink = [43, 23, 0];

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const table = crcTable();
const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const i = y * (size * 4 + 1) + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/**
 * @param size  output size in pixels
 * @param rounded  corner radius as a fraction of size (0 = full bleed)
 * @param moonScale  moon diameter as a fraction of size
 */
function icon(size, rounded, moonScale) {
  const S = 4;
  return png(size, (px, py) => {
    let bg = 0;
    let moon = 0;
    for (let sy = 0; sy < S; sy++) {
      for (let sx = 0; sx < S; sx++) {
        const x = (px + (sx + 0.5) / S) / size;
        const y = (py + (sy + 0.5) / S) / size;
        const r = rounded;
        const dx = Math.max(r - x, 0, x - (1 - r));
        const dy = Math.max(r - y, 0, y - (1 - r));
        const inBg = r === 0 || dx * dx + dy * dy <= r * r;
        if (!inBg) continue;
        bg++;
        const R = moonScale / 2;
        const inDisc = (x - 0.48) ** 2 + (y - 0.52) ** 2 <= R * R;
        const inBite = (x - 0.48 - R * 0.5) ** 2 + (y - 0.52 + R * 0.42) ** 2 <= (R * 0.8) ** 2;
        if (inDisc && !inBite) moon++;
      }
    }
    const total = S * S;
    const t = py / size;
    const base = mix(amberTop, amberBottom, t);
    const color = mix(base, ink, moon / Math.max(1, bg));
    return [...color, Math.round((bg / total) * 255)];
  });
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", icon(192, 0.22, 0.52));
writeFileSync("public/icons/icon-512.png", icon(512, 0.22, 0.52));
writeFileSync("public/icons/maskable-512.png", icon(512, 0, 0.42));
writeFileSync("public/icons/apple-touch.png", icon(180, 0, 0.5));
console.log("icons written to public/icons");
