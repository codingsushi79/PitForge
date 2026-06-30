#!/usr/bin/env node
/** Generate 256x256 PNG + classic multi-size ICO for electron-builder / NSIS */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = __dirname;
const SIZE = 256;
const ICO_SIZES = [16, 32, 48, 256];

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

function blend(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function pixelAt(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / (w * 0.42);
  const ny = (y - cy) / (h * 0.42);
  const r = Math.hypot(nx, ny);

  const corner = Math.max(Math.abs(nx), Math.abs(ny));
  if (corner > 1.02) return COLORS.bg;

  if (r > 0.78 && r < 0.95) {
    const t = (r - 0.78) / 0.17;
    return blend(COLORS.accent, COLORS.accentLight, t);
  }

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

/** Classic BMP-in-ICO image (required by NSIS makensis). */
function createIconBitmap(width, height) {
  const rowBytes = width * 4;
  const xorSize = rowBytes * height;
  const andRowBytes = Math.ceil(width / 32) * 4;
  const andSize = andRowBytes * height;

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(width, 4);
  header.writeInt32LE(height * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(xorSize + andSize, 20);

  const xor = Buffer.alloc(xorSize);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelAt(x, y, width, height);
      const dstY = height - 1 - y;
      const off = (dstY * width + x) * 4;
      xor[off] = b;
      xor[off + 1] = g;
      xor[off + 2] = r;
      xor[off + 3] = a;
    }
  }

  const and = Buffer.alloc(andSize);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [, , , a] = pixelAt(x, y, width, height);
      if (a >= 128) continue;
      const dstY = height - 1 - y;
      const byteIndex = dstY * andRowBytes + (x >> 3);
      and[byteIndex] |= 0x80 >> (x & 7);
    }
  }

  return Buffer.concat([header, xor, and]);
}

function createClassicIco(sizes) {
  const images = sizes.map((size) => ({
    width: size,
    height: size,
    data: createIconBitmap(size, size),
  }));

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map((img) => {
    const entry = Buffer.alloc(16);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[4] = 1;
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += img.data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((img) => img.data)]);
}

function main() {
  const pngPath = path.join(OUT_DIR, "icon.png");
  const icoPath = path.join(OUT_DIR, "icon.ico");

  fs.writeFileSync(pngPath, createPng(SIZE, SIZE, pixelAt));
  fs.writeFileSync(icoPath, createClassicIco(ICO_SIZES));

  console.log(`Wrote ${pngPath} (${SIZE}x${SIZE})`);
  console.log(`Wrote ${icoPath} (${ICO_SIZES.join(", ")}px classic ICO)`);
}

main();
