const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const IRONWOLF_README_URL =
  "https://raw.githubusercontent.com/TheIronWolfModding/rF2SharedMemoryMapPlugin/master/README.md";
const PLUGIN_DLL = "rFactor2SharedMemoryMapPlugin64.dll";

function fetchText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 8) {
      reject(new Error("Too many redirects"));
      return;
    }

    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": "PitForge-Link/1.0",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          fetchText(new URL(res.headers.location, url).href, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed (${res.statusCode}): ${url}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      }
    );

    req.on("error", reject);
    req.setTimeout(120_000, () => {
      req.destroy(new Error(`Request timed out: ${url}`));
    });
  });
}

function downloadBinary(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 8) {
      reject(new Error("Too many redirects"));
      return;
    }

    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": "PitForge-Link/1.0",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          downloadBinary(new URL(res.headers.location, url).href, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed (${res.statusCode}): ${url}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    );

    req.on("error", reject);
    req.setTimeout(300_000, () => {
      req.destroy(new Error(`Download timed out: ${url}`));
    });
  });
}

async function getDownloadPageUrlFromGithub() {
  const readme = await fetchText(IRONWOLF_README_URL);
  const match = readme.match(/https:\/\/www\.mediafire\.com\/file\/[^\s)\]]+/);
  if (!match) {
    throw new Error("Could not find download link in TheIronWolf GitHub README");
  }
  return match[0];
}

async function resolveMediaFireDirectUrl(pageUrl) {
  const html = await fetchText(pageUrl);
  const match = html.match(/href="(https:\/\/download\d+\.mediafire\.com\/[^"]+)"/);
  if (!match) {
    throw new Error("Could not resolve MediaFire direct download URL");
  }
  return match[1];
}

function findDllInZipEntries(entries) {
  return entries.find(
    (entry) =>
      !entry.isDirectory &&
      (entry.entryName.endsWith(`/${PLUGIN_DLL}`) || entry.entryName === PLUGIN_DLL)
  );
}

async function extractDllFromZip(zipBuffer) {
  let AdmZip;
  try {
    AdmZip = require("adm-zip");
  } catch {
    throw new Error("Missing adm-zip dependency — run npm install in pitforge-link");
  }

  const zip = new AdmZip(zipBuffer);
  const entry = findDllInZipEntries(zip.getEntries());
  if (!entry) {
    throw new Error(`${PLUGIN_DLL} not found in downloaded archive`);
  }
  return entry.getData();
}

async function downloadPluginDll(onProgress) {
  onProgress?.("Fetching latest download link from TheIronWolf GitHub…");
  const pageUrl = await getDownloadPageUrlFromGithub();

  onProgress?.("Resolving download URL…");
  const directUrl = await resolveMediaFireDirectUrl(pageUrl);

  onProgress?.("Downloading rF2 Shared Memory plugin…");
  const zipBuffer = await downloadBinary(directUrl);

  onProgress?.("Extracting plugin DLL…");
  const dllBuffer = await extractDllFromZip(zipBuffer);
  if (!dllBuffer || dllBuffer.length < 1024) {
    throw new Error("Downloaded plugin DLL looks invalid");
  }

  return dllBuffer;
}

function getCachedDllPath() {
  try {
    const { app } = require("electron");
    return path.join(app.getPath("userData"), "cache", PLUGIN_DLL);
  } catch {
    return path.join(require("os").tmpdir(), "pitforge-link", PLUGIN_DLL);
  }
}

async function ensurePluginDll(onProgress) {
  const cached = getCachedDllPath();
  if (fs.existsSync(cached)) {
    onProgress?.("Using cached plugin DLL");
    return cached;
  }

  const dllBuffer = await downloadPluginDll(onProgress);
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  fs.writeFileSync(cached, dllBuffer);
  onProgress?.("Cached plugin DLL for future installs");
  return cached;
}

module.exports = {
  PLUGIN_DLL,
  IRONWOLF_README_URL,
  downloadPluginDll,
  ensurePluginDll,
  getCachedDllPath,
};
