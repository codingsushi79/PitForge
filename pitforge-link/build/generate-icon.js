#!/usr/bin/env node
/** Generate 256x256 PNG (+ multi-size ICO) for electron-builder */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = __dirname;
const SIZE = 256;

const COLORS = {
  bg: [13, 13, 18, 255],
  accent: [232, 93, 4, 255],
  accentLight: [255, 140, 60, 255],
  white: [255, 255, 255, 255],
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelAt) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    rows.push(0);
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelAt(x, y, width, height);
      rows.push(r, g, b, a);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const compressed = zlib.deflateSync(Buffer.from(rows), { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function pixelAt(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / (w * 0.42);
  const ny = (y - cy) / (h * 0.42);
  const r = Math.hypot(nx, ny);

  // Rounded square background
  const corner = Math.max(Math.abs(nx), Math.abs(ny));
  if (corner > 1.02) return COLORS.bg;

  // Ember ring
  if (r > 0.78 && r < 0.95) {
    const t = (r - 0.78) / 0.17;
    return blend(COLORS.accent, COLORS.accentLight, t);
  }

  // Inner forge mark — stylized flame / link
  const flame =
    ny < 0.15 + 0.55 * Math.exp(-Math.pow(nx * 2.2, 2)) &&
    ny > -0.55 &&
    Math.abs(nx) < 0.38;
  const linkRing = r > 0.28 && r < 0.52 && Math.abs(ny + 0.05) < 0.22;
  const linkBar = Math.abs(ny + 0.05) < 0.08 && Math.abs(nx) < 0.42;

  if (flame || linkRing || linkBar) return COLORS.white;

  if (corner <= 1) return blend(COLORS.bg, [28, 28, 38, 255], 0.35);

  return COLORS.bg;
}

function blend(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function createIcoFromPng(pngBuffer, size) {
  // ICO with embedded PNG (Vista+ format)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry[2] = 0;
  entry[3] = 0;
  entry[4] = 1;
  entry[5] = 0;
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

function main() {
  const png = createPng(SIZE, SIZE, pixelAt);
  const pngPath = path.join(OUT_DIR, "icon.png");
  fs.writeFileSync(pngPath, png);

  const icoPath = path.join(OUT_DIR, "icon.ico");
  fs.writeFileSync(icoPath, createIcoFromPng(png, SIZE));

  console.log(`Wrote ${pngPath} (${SIZE}x${SIZE})`);
  console.log(`Wrote ${icoPath}`);
}

main();
