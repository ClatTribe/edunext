/**
 * build-college-list.js   (STEP 1 of 2)
 * Builds the MASTER LIST of every collegedunia college/university profile URL.
 *
 * Sources, merged + de-duplicated by collegedunia id:
 *   1. collegedunia XML sitemaps (handles .gz, recurses through sitemap indexes)
 *   2. your existing raw .jsonl files (so nothing you already have is ever lost)
 *
 * USAGE
 *   npm install axios
 *   node build-college-list.js
 *
 * It reads any *.jsonl you list in EXISTING_FILES below and writes:
 *   _index/college-urls.txt   -> one profile URL per line (this feeds STEP 2)
 *
 * Each line is a clean profile URL like:
 *   https://collegedunia.com/college/32-arulmigu-...   (or /university/<id>-...)
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const axios = require("axios");

const OUT_DIR = path.join(__dirname, "_index");
const OUT_FILE = path.join(OUT_DIR, "college-urls.txt");

// your existing raw files (relative to this script) - used to seed/merge the list
const EXISTING_FILES = [
  "../all_data.jsonl",
  "../all_data_2.jsonl",
  "../all_data_3.jsonl",
  "../all_data_4.jsonl",
  "../universities_data (1).jsonl",
  "../universities_new_data.jsonl",
  "../college_data.jsonl",
];

// sitemap entry points (from collegedunia robots.txt). The script follows indexes.
const SITEMAPS = [
  "https://collegedunia.com/sitemap-index-updates.xml",
  "https://collegedunia.com/sitemap-updates.xml",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};
const TIMEOUT = 45000;
const DELAY_MS = 800;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// id + clean profile url from any collegedunia url
const PROFILE_RE = /https?:\/\/collegedunia\.com\/(?:college|university)\/(\d+)-[a-z0-9-]+/gi;

async function fetchBuffer(url) {
  try {
    const res = await axios.get(url, {
      headers: HEADERS,
      timeout: TIMEOUT,
      responseType: "arraybuffer",
    });
    let buf = Buffer.from(res.data);
    // gunzip if it's gzipped (magic bytes 1f 8b) or url ends with .gz
    if (url.endsWith(".gz") || (buf[0] === 0x1f && buf[1] === 0x8b)) {
      try { buf = zlib.gunzipSync(buf); } catch (_) {}
    }
    return buf.toString("utf8");
  } catch (err) {
    console.warn(`   ! sitemap fetch failed: ${url} (${err.code || err.message})`);
    return "";
  }
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) locs.push(m[1].trim());
  return locs;
}

// recursively walk sitemaps; collect profile urls keyed by id
async function crawlSitemap(url, found, seenSitemaps, depth = 0) {
  if (seenSitemaps.has(url) || depth > 4) return;
  seenSitemaps.add(url);
  console.log(`   sitemap: ${url}`);
  const xml = await fetchBuffer(url);
  if (!xml) return;

  // any profile urls directly in this sitemap
  let m;
  PROFILE_RE.lastIndex = 0;
  while ((m = PROFILE_RE.exec(xml))) {
    const id = m[1];
    if (!found.has(id)) found.set(id, m[0]);
  }

  // follow nested sitemaps (.xml / .xml.gz locs that are themselves sitemaps)
  const locs = extractLocs(xml);
  for (const loc of locs) {
    if (/\.xml(\.gz)?$/i.test(loc)) {
      await sleep(DELAY_MS);
      await crawlSitemap(loc, found, seenSitemaps, depth + 1);
    }
  }
}

function mergeExisting(found) {
  for (const rel of EXISTING_FILES) {
    const file = path.join(__dirname, rel);
    if (!fs.existsSync(file)) continue;
    let n = 0;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const s = line.trim();
      if (!s) continue;
      try {
        const d = JSON.parse(s);
        const url = d.url || "";
        const mm = url.match(/\/(?:college|university)\/(\d+)-[a-z0-9-]+/i);
        if (mm) {
          const id = mm[1];
          const clean = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
          if (!found.has(id)) { found.set(id, clean); n++; }
        }
      } catch (_) {}
    }
    console.log(`   merged ${n} new ids from ${rel}`);
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const found = new Map(); // id -> url

  console.log("1) Crawling collegedunia sitemaps...");
  const seen = new Set();
  for (const sm of SITEMAPS) {
    await crawlSitemap(sm, found, seen);
  }
  console.log(`   sitemap urls found: ${found.size}`);

  console.log("2) Merging your existing raw files...");
  mergeExisting(found);

  const urls = [...found.values()].sort();
  fs.writeFileSync(OUT_FILE, urls.join("\n") + "\n", "utf8");
  console.log(`\nDONE. ${urls.length} unique college URLs -> ${OUT_FILE}`);
  if (found.size < 5000) {
    console.log(
      "\nNOTE: if the sitemap yielded few profile URLs, the list is still complete\n" +
      "from your existing files. To capture brand-new colleges, also point SITEMAPS\n" +
      "at collegedunia's college-profile sitemap once located (check sitemap-updates.xml)."
    );
  }
}

main();
