/**
 * ============================================================
 *  College Image Finder & ImageKit Uploader (Node.js)
 *  ZERO DEPENDENCIES — uses only built-in Node.js modules
 *
 *  v1 (ImageKit): Replaced Cloudinary with ImageKit upload API
 * ============================================================
 *
 *  SETUP:
 *    1. Put this file inside your "script" folder (next to images.csv)
 *    2. Run directly:  node script/college_image_uploader.js
 *
 *  OPTIONS:
 *    node script/college_image_uploader.js                        → first 3500
 *    node script/college_image_uploader.js --start 0 --end 100   → rows 0-100
 *    node script/college_image_uploader.js --resume               → continue from last stop
 *    node script/college_image_uploader.js --debug                → save raw HTML responses
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const crypto = require("crypto");

// ─── CONFIGURATION ──────────────────────────────────────────────────────────

const CONFIG = {
  imagekit: {
    publicKey:   "public_pSqQv0E8g287joaDr+K4isPQZro=",
    privateKey:  "private_EraIbedFa4rUMf2CtyKyBblquVI=",
    urlEndpoint: "https://ik.imagekit.io/getEdunext",
    folder:      "/college_microsites",
  },

  inputCsv:     path.join(__dirname, "images.csv"),
  outputCsv:    path.join(__dirname, "images_with_imagekit.csv"),
  progressFile: path.join(__dirname, "upload_progress.json"),

  minImages: 1,
  maxImages: 2,

  delayBetweenColleges: 2000,
  requestTimeout:       15000,
  defaultBatchSize:     3500,
};

let DEBUG_MODE = false;
let firstCollege = true;

const HEADERS_GOOGLE = {
  "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
  "Cache-Control":   "no-cache",
};

const HEADERS_BING = {
  "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
};

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg, type = "info") {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  const prefix = { info: "i ", success: "OK", warn: "! ", error: "X " };
  console.log(`[${time}] ${prefix[type] || "  "} ${msg}`);
}

function sanitize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

function isGoodImageUrl(url) {
  if (!url || url.length < 20) return false;
  if (!url.startsWith("http")) return false;
  const lower = url.toLowerCase();

  const skipDomains = [
    "google.com", "gstatic.com", "googleapis.com", "bing.com", "bing.net",
    "microsoft.com", "msn.com", "facebook.com", "twitter.com", "instagram.com",
    "youtube.com", "linkedin.com", "pinterest.com", "tiktok.com",
    "play-store", "app-store", "w3.org", "schema.org",
  ];
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (skipDomains.some((d) => hostname.includes(d))) return false;
  } catch {
    return false;
  }

  const skipPatterns = [
    "favicon", "sprite", "pixel", "1x1", "spacer",
    "tracking", "analytics", "ads/", "advertisement",
    "emoji", "smiley", "loader", "spinner",
    ".svg", ".gif", ".ico", ".css", ".js",
  ];
  if (skipPatterns.some((p) => lower.includes(p))) return false;

  return true;
}

// ─── HTTP HELPER ────────────────────────────────────────────────────────────

function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || CONFIG.requestTimeout;
    const maxRedirects = options.maxRedirects ?? 5;

    function doRequest(reqUrl, redirectsLeft) {
      const parsed = new URL(reqUrl);
      const lib = parsed.protocol === "https:" ? https : http;

      const req = lib.get(
        reqUrl,
        { headers: options.headers || HEADERS_GOOGLE, timeout },
        (res) => {
          if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            if (redirectsLeft <= 0) return reject(new Error("Too many redirects"));
            const nextUrl = new URL(res.headers.location, reqUrl).href;
            return doRequest(nextUrl, redirectsLeft - 1);
          }

          if (res.statusCode < 200 || res.statusCode >= 400) {
            res.resume();
            return reject(new Error(`HTTP ${res.statusCode}`));
          }

          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, data: Buffer.concat(chunks).toString("utf8") }));
          res.on("error", reject);
        }
      );

      req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
      req.on("error", reject);
    }

    doRequest(url, maxRedirects);
  });
}

// ─── DEBUG HELPER ───────────────────────────────────────────────────────────

function debugDump(filename, content) {
  if (DEBUG_MODE || firstCollege) {
    const debugDir = path.join(__dirname, "debug");
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
    fs.writeFileSync(path.join(debugDir, filename), content, "utf8");
    log(`  [DEBUG] Saved ${filename} (${content.length} bytes)`);
  }
}

// ─── IMAGE SEARCH: GOOGLE ──────────────────────────────────────────────────

async function searchGoogleImages(query) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  try {
    const resp = await httpGet(searchUrl, { headers: HEADERS_GOOGLE });
    const html = resp.data;
    if (firstCollege) {
      debugDump("google_images_response.html", html);
      log(`  [DEBUG] Google response length: ${html.length} chars`);
    }
    const imageUrls = extractUrlsFromGoogleHtml(html);
    if (imageUrls.length > 0) return imageUrls;

    await sleep(1000);
    const resp2 = await httpGet(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { headers: HEADERS_GOOGLE });
    if (firstCollege) debugDump("google_web_response.html", resp2.data);
    return extractUrlsFromGoogleHtml(resp2.data);
  } catch (err) {
    log(`  Google search failed: ${err.message}`, "warn");
    return [];
  }
}

function extractUrlsFromGoogleHtml(html) {
  const imageUrls = [];
  const unescaped = html
    .replace(/\\u003d/gi, "=").replace(/\\u0026/gi, "&").replace(/\\u002F/gi, "/")
    .replace(/\\x3d/gi, "=").replace(/\\x26/gi, "&").replace(/\\x2F/gi, "/")
    .replace(/\\\//g, "/");

  const patterns = [
    /\["(https?:\/\/[^"]{30,})",\s*\d+,\s*\d+\]/g,
    /"ou"\s*:\s*"(https?:\/\/[^"]+)"/g,
    /imgurl=(https?:\/\/[^&"]+)/g,
    /"(https?:\/\/[^"]{20,}\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/gi,
    /\[[\d,]*"(https?:\/\/[^"]{30,})"[\d,]*\]/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(unescaped)) !== null) {
      const url = pattern.source.includes("imgurl") ? decodeURIComponent(match[1]) : match[1];
      if (isGoodImageUrl(url)) imageUrls.push(url);
    }
  }

  // img tags
  const imgTagPattern = /<img[^>]+(?:src|data-src)\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgTagPattern.exec(html)) !== null) {
    if (isGoodImageUrl(match[1])) imageUrls.push(match[1]);
  }

  return [...new Set(imageUrls)].slice(0, 15);
}

// ─── IMAGE SEARCH: BING ────────────────────────────────────────────────────

async function searchBingImages(query) {
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  try {
    const resp = await httpGet(searchUrl, { headers: HEADERS_BING });
    const html = resp.data;
    if (firstCollege) {
      debugDump("bing_response.html", html);
      log(`  [DEBUG] Bing response length: ${html.length} chars`);
    }

    const imageUrls = [];
    const patterns = [
      /"murl"\s*:\s*"(https?:\/\/[^"]+)"/gi,
      /mediaurl=(https?[^&"]+)/gi,
      /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/gi,
      /data-src="(https?:\/\/[^"]+)"/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1].replace(/\\u002f/gi, "/").replace(/\\\//g, "/");
        const decoded = pattern.source.includes("mediaurl") ? decodeURIComponent(url) : url;
        if (isGoodImageUrl(decoded)) imageUrls.push(decoded);
      }
    }

    return [...new Set(imageUrls)].slice(0, 15);
  } catch (err) {
    log(`  Bing search failed: ${err.message}`, "warn");
    return [];
  }
}

// ─── IMAGE SEARCH: DUCKDUCKGO ──────────────────────────────────────────────

async function searchDuckDuckGoImages(query) {
  const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
  try {
    const resp = await httpGet(searchUrl, { headers: HEADERS_GOOGLE });
    const html = resp.data;
    if (firstCollege) debugDump("ddg_response.html", html);

    const imageUrls = [];
    const urlRegex = /"(https?:\/\/[^"]{20,}\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
    let match;
    while ((match = urlRegex.exec(html)) !== null) {
      if (isGoodImageUrl(match[1])) imageUrls.push(match[1]);
    }
    return [...new Set(imageUrls)].slice(0, 10);
  } catch (err) {
    log(`  DuckDuckGo search failed: ${err.message}`, "warn");
    return [];
  }
}

// ─── IMAGEKIT UPLOAD ────────────────────────────────────────────────────────

async function imagekitUpload(imageUrl, collegeName, index) {
  // ImageKit upload API endpoint
  const uploadEndpoint = "https://upload.imagekit.io/api/v1/files/upload";

  // fileName for ImageKit
  const fileName = `${sanitize(collegeName)}_${index}.jpg`;
  const filePath = `${CONFIG.imagekit.folder}/${sanitize(collegeName)}_${index}`;

  // Build multipart form body
  const boundary = "----ImageKitBoundary" + Date.now();

  const fields = {
    file:              imageUrl,         // ImageKit accepts a URL directly
    fileName:          fileName,
    folder:            CONFIG.imagekit.folder,
    useUniqueFileName: "true",           // avoid collisions
    isPrivateFile:     "false",
    overwriteFile:     "true",
  };

  let body = "";
  for (const [key, val] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${val}\r\n`;
  }
  body += `--${boundary}--\r\n`;

  // ImageKit uses HTTP Basic Auth: privateKey as username, empty password
  const auth = Buffer.from(`${CONFIG.imagekit.privateKey}:`).toString("base64");

  return new Promise((resolve, reject) => {
    const parsed = new URL(uploadEndpoint);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname,
        method:   "POST",
        headers:  {
          "Content-Type":   `multipart/form-data; boundary=${boundary}`,
          "Content-Length": Buffer.byteLength(body),
          Authorization:    `Basic ${auth}`,
        },
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          try {
            const json = JSON.parse(raw);
            // ImageKit returns { url, fileId, name, ... } on success
            if (json.url) {
              resolve(json.url);
            } else {
              reject(new Error(json.message || JSON.stringify(json)));
            }
          } catch {
            reject(new Error("Invalid JSON from ImageKit"));
          }
        });
        res.on("error", reject);
      }
    );
    req.on("timeout", () => { req.destroy(); reject(new Error("Upload timeout")); });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function uploadToImageKit(imageUrl, collegeName, index) {
  try {
    return await imagekitUpload(imageUrl, collegeName, index);
  } catch (err) {
    log(`  Upload failed: ${err.message}`, "warn");
    return null;
  }
}

// ─── IMAGEKIT PING ──────────────────────────────────────────────────────────

function imagekitPing() {
  const auth = Buffer.from(`${CONFIG.imagekit.privateKey}:`).toString("base64");
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.imagekit.io",
        path:     "/v1/files?limit=1",
        method:   "GET",
        headers:  { Authorization: `Basic ${auth}` },
        timeout:  10000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          if (res.statusCode === 200) resolve(true);
          else {
            const body = Buffer.concat(chunks).toString("utf8");
            reject(new Error(`Ping returned ${res.statusCode}: ${body}`));
          }
        });
        res.on("error", reject);
      }
    );
    req.on("timeout", () => { req.destroy(); reject(new Error("Ping timeout")); });
    req.on("error", reject);
    req.end();
  });
}

// ─── PROGRESS MANAGEMENT ────────────────────────────────────────────────────

function loadProgress() {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.progressFile, "utf8"));
    }
  } catch {}
  return { completedIds: [], lastRow: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
}

// ─── CSV PARSER ─────────────────────────────────────────────────────────────

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { result.push(current.trim()); current = ""; }
      else { current += char; }
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content) {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
    rows.push(row);
  }
  return rows;
}

function stringifyCsv(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escapeField = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.map(escapeField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeField(row[h])).join(","));
  }
  return lines.join("\n");
}

// ─── MAIN PIPELINE FOR ONE COLLEGE ──────────────────────────────────────────

async function processCollege(collegeName, collegeId) {
  const targetCount = CONFIG.maxImages;
  log(`Processing: ${collegeName} (ID: ${collegeId}) — target: ${targetCount} images`);

  let allCandidates = [];

  // Step 1: Google
  const googleQuery = `${collegeName} campus India`;
  log(`  -> Google: "${googleQuery}"`);
  const googleImages = await searchGoogleImages(googleQuery);
  allCandidates.push(...googleImages);
  log(`  -> Found ${googleImages.length} via Google`);

  // Step 2: Bing fallback
  if (allCandidates.length < 2) {
    await sleep(1500);
    const bingQuery = `${collegeName} college campus`;
    log(`  -> Bing: "${bingQuery}"`);
    const bingImages = await searchBingImages(bingQuery);
    allCandidates.push(...bingImages);
    log(`  -> Found ${bingImages.length} via Bing`);
  }

  // Step 3: DuckDuckGo fallback
  if (allCandidates.length === 0) {
    await sleep(1000);
    const ddgQuery = `${collegeName} college photo`;
    log(`  -> DuckDuckGo: "${ddgQuery}"`);
    const ddgImages = await searchDuckDuckGoImages(ddgQuery);
    allCandidates.push(...ddgImages);
    log(`  -> Found ${ddgImages.length} via DuckDuckGo`);
  }

  // Deduplicate
  const seen = new Set();
  const uniqueCandidates = allCandidates.filter((u) => {
    const clean = u.split("?")[0];
    if (seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });

  if (uniqueCandidates.length === 0) {
    log(`  X No images found for ${collegeName}`, "warn");
    if (firstCollege) log(`  [DEBUG] Check debug/ folder for raw HTML responses`, "warn");
    return [];
  }

  log(`  Found ${uniqueCandidates.length} candidates, uploading top ${targetCount}...`);
  if (firstCollege) {
    log(`  [DEBUG] First 3 candidate URLs:`);
    uniqueCandidates.slice(0, 3).forEach((u, i) => log(`    ${i + 1}: ${u.slice(0, 120)}`));
  }

  const imagekitUrls = [];
  for (let i = 0; i < uniqueCandidates.length && imagekitUrls.length < targetCount; i++) {
    const ikUrl = await uploadToImageKit(uniqueCandidates[i], collegeName, imagekitUrls.length + 1);
    if (ikUrl) {
      imagekitUrls.push(ikUrl);
      log(`  OK Uploaded ${imagekitUrls.length}/${targetCount}`, "success");
    }
  }

  if (imagekitUrls.length > 0) {
    log(`  Done: ${imagekitUrls.length} images for ${collegeName}`, "success");
  } else {
    log(`  X Could not upload any images for ${collegeName}`, "error");
  }

  firstCollege = false;
  return imagekitUrls;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let startRow = 0;
  let endRow = CONFIG.defaultBatchSize;
  let resume = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--start") startRow = parseInt(args[i + 1]) || 0;
    if (args[i] === "--end")   endRow   = parseInt(args[i + 1]) || CONFIG.defaultBatchSize;
    if (args[i] === "--resume") resume  = true;
    if (args[i] === "--debug")  DEBUG_MODE = true;
  }

  const progress = loadProgress();
  if (resume) {
    startRow = progress.lastRow;
    endRow = startRow + CONFIG.defaultBatchSize;
    log(`Resuming from row ${startRow}`);
  }

  log("Testing ImageKit connection...");
  try {
    await imagekitPing();
    log("ImageKit connected!", "success");
  } catch (err) {
    log(`ImageKit connection failed: ${err.message}`, "error");
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.inputCsv)) {
    log(`CSV not found: ${CONFIG.inputCsv}`, "error");
    process.exit(1);
  }

  log(`Reading CSV: ${CONFIG.inputCsv}`);
  const csvContent = fs.readFileSync(CONFIG.inputCsv, "utf8");
  const rows = parseCsv(csvContent);
  log(`Total colleges: ${rows.length}`);

  endRow = Math.min(endRow, rows.length);
  const batch = rows.slice(startRow, endRow);

  log(`\nProcessing batch: rows ${startRow} to ${endRow} (${batch.length} colleges)`);
  log(`DEBUG: Will save raw HTML for first college to script/debug/ folder`);
  log("=".repeat(70));

  let processed = 0, uploaded = 0, failed = 0, skipped = 0;

  for (let i = 0; i < batch.length; i++) {
    const rowIdx = startRow + i;
    const row = rows[rowIdx];
    const { id, title, image } = row;

    if (image && image !== "null" && image !== "") {
      log(`[${rowIdx}] Skipping ${title} — already has images`);
      skipped++;
      continue;
    }
    if (!title || !title.trim()) continue;

    try {
      const imagekitUrls = await processCollege(title.trim(), id);

      if (imagekitUrls.length > 0) {
        row.image = JSON.stringify(imagekitUrls);
        uploaded++;
      } else {
        failed++;
      }
      processed++;

      if (processed % 5 === 0) {
        progress.lastRow = rowIdx + 1;
        progress.completedIds.push(id);
        saveProgress(progress);
        fs.writeFileSync(CONFIG.outputCsv, stringifyCsv(rows), "utf8");
        log(`\n--- Progress saved. Processed: ${processed} | Uploaded: ${uploaded} | Failed: ${failed} ---\n`);
      }

      await sleep(CONFIG.delayBetweenColleges);
    } catch (err) {
      log(`Error processing ${title}: ${err.message}`, "error");
      failed++;
    }
  }

  progress.lastRow = endRow;
  saveProgress(progress);
  fs.writeFileSync(CONFIG.outputCsv, stringifyCsv(rows), "utf8");

  log("\n" + "=".repeat(70));
  log("BATCH COMPLETE!", "success");
  log(`  Processed: ${processed}`);
  log(`  Uploaded:  ${uploaded}`, "success");
  log(`  Failed:    ${failed}`, failed > 0 ? "warn" : "info");
  log(`  Skipped:   ${skipped}`);
  log(`  Output:    ${CONFIG.outputCsv}`, "success");
  log(`\n  Next batch: node script/college_image_uploader.js --start ${endRow} --end ${endRow + CONFIG.defaultBatchSize}`);
}

process.on("SIGINT", () => {
  log("\n\nInterrupted! Saving progress...", "warn");
  saveProgress(loadProgress());
  log("Progress saved. Resume with: node script/college_image_uploader.js --resume", "warn");
  process.exit(0);
});

main().catch((err) => {
  log(`Fatal error: ${err.message}`, "error");
  console.error(err);
  process.exit(1);
});