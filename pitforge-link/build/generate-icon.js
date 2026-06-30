#!/usr/bin/env node
/** Generate a minimal 256x256 PNG icon for electron-builder */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname);
// Minimal valid 16x16 orange PNG (base64)
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHUlEQVR42mNk+M9Qz0BFYBxVSFSgEsVQI1CNATXUAQAXBwEAAf4B5QAAAABJRU5ErkJggg==",
  "base64"
);
fs.writeFileSync(path.join(dir, "icon.png"), png);
console.log("Wrote build/icon.png (replace with proper 256x256 icon for production)");
