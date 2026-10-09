/**
 * scrape-college.js   (STEP 2 of 2)
 * Scrapes collegedunia profiles -> raw JSON in your existing 15-key schema,
 * saved as CHUNKED JSONL (default 1000 colleges per file, so no giant file).
 *
 * Output shape per college (same as your universities_data / all_data .jsonl):
 *   { id, url, title, address, contact, email, about,
 *     fees, courses, placement, cutoff, reviews, ranking, admission, scholarship }
 *
 * Each of fees/placement/cutoff/ranking/admission/scholarship is an array of
 *   { heading, headers:[...], rows:[[...], ...] }   (same as your DB raw data).
 *
 * USAGE
 *   npm install axios cheerio
 *
 *   # 1) build the master list first (see build-college-list.js):
 *   node build-college-list.js
 *
 *   # 2) scrape everything in the list (reads _index/college-urls.txt):
 *   node scrape-college.js
 *
 *   # or scrape a single college:
 *   node scrape-college.js "https://collegedunia.com/university/25494-iima-..."
 *
 *   # or a custom list file:
 *   node scrape-college.js --from-list path/to/urls.txt
 *
 * Stop any time with Ctrl+C and re-run — it skips colleges already done
 * (tracked in _index/processed.json).
 *
 * OUTPUT FOLDER:  ./colleges/colleges_0001.jsonl, colleges_0002.jsonl, ...
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

// ----------------------------- config --------------------------------------

const LIST_FILE     = path.join(__dirname, "_index", "college-urls.txt");
const OUT_DIR       = path.join(__dirname, "testcollege");
const STATE_DIR     = path.join(__dirname, "_index");
const PROCESSED_FILE= path.join(STATE_DIR, "processed.json");

const RECORDS_PER_FILE = 5000;   // colleges per JSONL file
const DELAY_MS = 1500;           // politeness delay between requests
const RETRIES = 3;
const TIMEOUT = 45000;

// dedicated tabs: take ALL tables from that tab (matches your D1 behaviour, e.g.
// admission already mixes cutoff/RTI tables just like your existing data).
const DEDICATED_TABS = {
  admission: ["admission"],
  cutoff:    ["cutoff"],
  ranking:   ["ranking"],
};

// fees & placement tabs on collegedunia often redirect to one big mega-page, so we
// take the tables and KEEP ONLY the ones whose heading matches the field keyword.
// (scholarship stays [] on purpose — in your D1, scholarship tables live inside fees.)
const FILTERED_FIELDS = {
  fees:      { tabs: ["courses-fees", "courses-and-fees"], kw: /fee|scholarship|course|tuition/i, isFee: true },
  placement: { tabs: ["placement", "placements"],         kw: /placement|recruiter|package|salary|compan|ctc|offers/i, isFee: false },
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ----------------------------- fetch + parse -------------------------------

async function fetchHtml(url) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: TIMEOUT });
      return res.data;
    } catch (err) {
      const code = err.response ? err.response.status : err.code;
      if (code === 404) return null;            // tab/college doesn't exist
      console.warn(`   ! fetch ${code} (try ${attempt}/${RETRIES}) ${url}`);
      if (attempt === RETRIES) return null;
      await sleep(DELAY_MS * attempt);
    }
  }
  return null;
}

function baseUrl(url) {
  const m = url.match(/^(https?:\/\/[^?#]*\/(?:college|university)\/\d+-[^/?#]+)/i);
  return m ? m[1] : url.replace(/\/+$/, "");
}
function idFromUrl(url) {
  const m = url.match(/\/(?:college|university)\/(\d+)-/i);
  return m ? parseInt(m[1], 10) : null;
}
function slugFromUrl(url) {
  const m = url.match(/\/(?:college|university)\/\d+-([^/?#]+)/i);
  return m ? m[1] : null;
}
function clean(t) {
  return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function parseTable($, table) {
  const $t = $(table);
  let headers = [];
  const theadTh = $t.find("thead th");
  if (theadTh.length) {
    theadTh.each((i, th) => headers.push(clean($(th).text())));
  } else {
    const firstTr = $t.find("tr").first();
    if (firstTr.find("th").length)
      firstTr.find("th").each((i, th) => headers.push(clean($(th).text())));
  }
  const rows = [];
  const bodyRows = $t.find("tbody tr").length ? $t.find("tbody tr") : $t.find("tr");
  bodyRows.each((i, tr) => {
    const cells = [];
    $(tr).find("td,th").each((j, td) => cells.push(clean($(td).text())));
    if (cells.length && !(i === 0 && headers.length && $(tr).find("th").length))
      rows.push(cells);
  });
  return { headers, rows };
}

function extractTables($, scope) {
  const blocks = [];
  let lastHeading = "";
  $(scope).find("h1,h2,h3,h4,table").each((i, el) => {
    const tag = el.tagName ? el.tagName.toLowerCase() : el.name;
    if (tag !== "table") { lastHeading = clean($(el).text()); return; }
    const { headers, rows } = parseTable($, el);
    if (rows.length) blocks.push({ heading: lastHeading, headers, rows });
  });
  return blocks;
}

function normalizeFeeBlocks(blocks) {
  return blocks.map((b) => {
    const h = b.headers.map((x) => x.toLowerCase());
    const isCards =
      h.includes("course") && h.includes("total fees") &&
      h.includes("eligibility") && (h.includes("action") || h.includes("application date"));
    if (!isCards) return b;
    return {
      heading: b.heading,
      headers: b.headers,
      rows: b.rows.map((r) => ({
        base_data: Array.isArray(r) ? r : [r],
        sub_courses: [],
        detailed_fees: {},
      })),
    };
  });
}

function parseInfo($) {
  const meta = (n) =>
    $(`meta[name="${n}"]`).attr("content") ||
    $(`meta[property="${n}"]`).attr("content") || "";
  let title = clean(meta("og:title") || $("title").first().text());
  let about = clean(meta("description") || meta("og:description"));

  // FIXED: read the CollegeOrUniversity JSON-LD block (not Collegedunia's own
  // Organization block, which carries Collegedunia's office address + phone).
  let col = null;
  $('script[type="application/ld+json"]').each((i, el) => {
    if (col) return;
    let d;
    try { d = JSON.parse($(el).contents().text()); } catch (_) { return; }
    for (const it of (Array.isArray(d) ? d : [d])) {
      if (it && it["@type"] === "CollegeOrUniversity") col = it;
    }
  });

  let email = null, contact = null, street = "";
  if (col) {
    if (col.name) title = clean(col.name);
    email = col.email || null;
    contact = col.telephone ? clean(String(col.telephone)) : null;
    const a = col.address || {};
    street = clean(a.streetAddress || "");
  }
  // Fallbacks only if the CollegeOrUniversity block was missing.
  if (!email) {
    const mm = $('a[href^="mailto:"]').first().attr("href");
    if (mm) email = mm.replace(/^mailto:/i, "").trim();
  }
  if (!contact) {
    const tt = $('a[href^="tel:"]').first().attr("href");
    if (tt) contact = tt.replace(/^tel:/i, "").trim();
  }

  return {
    title, about,
    email: email || null,
    contact: contact || null,
    address: { "@type": "PostalAddress", streetAddress: street },
  };
}

async function scrapeCollege(url) {
  const base = baseUrl(url);
  const id = idFromUrl(base);
  const record = {
    id, url: base, title: "",
    address: { "@type": "PostalAddress", streetAddress: "" },
    contact: null, email: null, about: "",
    fees: [], courses: "See Fees Section",
    placement: [], cutoff: [], reviews: {},
    ranking: [], admission: [], scholarship: [],
  };

  const infoHtml = await fetchHtml(base);
  if (infoHtml) Object.assign(record, parseInfo(cheerio.load(infoHtml)));
  await sleep(DELAY_MS);

  const scopeOf = ($) =>
    $("main").length ? $("main") : $("article").length ? $("article") : $("body");

  // tables on the base/info page (used as fallback for fees/placement)
  let baseBlocks = [];
  if (infoHtml) {
    const $b = cheerio.load(infoHtml);
    baseBlocks = extractTables($b, scopeOf($b));
  }

  // dedicated tabs -> take all tables from that tab
  for (const [field, tabs] of Object.entries(DEDICATED_TABS)) {
    for (const tab of tabs) {
      const html = await fetchHtml(`${base}/${tab}`);
      await sleep(DELAY_MS);
      if (!html) continue;
      const $ = cheerio.load(html);
      const blocks = extractTables($, scopeOf($));
      if (blocks.length) { record[field] = blocks; break; }
    }
  }

  // fees & placement -> collect tables, then keep only heading-matching ones
  for (const [field, cfg] of Object.entries(FILTERED_FIELDS)) {
    let blocks = [];
    for (const tab of cfg.tabs) {
      const html = await fetchHtml(`${base}/${tab}`);
      await sleep(DELAY_MS);
      if (!html) continue;
      const $ = cheerio.load(html);
      blocks = extractTables($, scopeOf($));
      if (blocks.length) break;
    }
    if (!blocks.length) blocks = baseBlocks;
    blocks = blocks.filter((b) => cfg.kw.test(b.heading));
    if (cfg.isFee) blocks = normalizeFeeBlocks(blocks);
    record[field] = blocks;
  }

  return record;
}

// ----------------------------- chunked output ------------------------------

function loadProcessed() {
  try { return new Set(JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf8"))); }
  catch (_) { return new Set(); }
}
function saveProcessed(set) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...set]), "utf8");
}
function chunkFileFor(count) {
  if (process.env.CUSTOM_OUT) return path.resolve(__dirname, process.env.CUSTOM_OUT);
  const idx = Math.floor(count / RECORDS_PER_FILE) + 1;
  return path.join(OUT_DIR, `testcollege_${String(idx).padStart(4, "0")}.jsonl`);
}

// ----------------------------- runner --------------------------------------

function readList(file) {
  return fs.readFileSync(file, "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const args = process.argv.slice(2);
  let urls;

  if (args[0] && !args[0].startsWith("--")) {
    urls = [args[0]];                       // single url mode
  } else if (args[0] === "--from-list") {
    urls = readList(args[1]);
  } else {
    if (!fs.existsSync(LIST_FILE)) {
      console.error(`No list found at ${LIST_FILE}\nRun:  node build-college-list.js  first.`);
      process.exit(1);
    }
    urls = readList(LIST_FILE);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(STATE_DIR, { recursive: true });

  const processed = loadProcessed();
  let writtenCount = processed.size;   // so chunk numbering continues on resume
  console.log(`Total: ${urls.length} | already done: ${processed.size} | per file: ${RECORDS_PER_FILE}\n`);

  let i = 0;
  for (const url of urls) {
    i++;
    const id = idFromUrl(url);
    if (id == null) { console.log(`[${i}] skip (no id) ${url}`); continue; }
    if (!process.env.CUSTOM_OUT && processed.has(id)) continue;

    console.log(`[${i}/${urls.length}] id=${id}`);
    try {
      const record = await scrapeCollege(url);
      const line = JSON.stringify(record) + "\n";
      fs.appendFileSync(chunkFileFor(writtenCount), line, "utf8");
      writtenCount++;
      processed.add(id);
      if (processed.size % 25 === 0) saveProcessed(processed);   // checkpoint
      const c = ["fees","placement","cutoff","ranking","admission","scholarship"]
        .map((f) => `${f[0]}:${record[f].length}`).join(" ");
      console.log(`   -> ${path.basename(chunkFileFor(writtenCount - 1))}  [${c}]`);
    } catch (err) {
      console.error(`   FAILED id=${id}: ${err.message}`);
    }
  }
  saveProcessed(processed);
  console.log(`\nDone. ${processed.size} colleges across ${OUT_DIR}`);
}

main();
