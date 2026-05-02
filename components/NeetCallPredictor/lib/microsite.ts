// Resolve our predictor's college names against Supabase `college_microsites`
// so matched tiles can become clickable links to /college/{slug}.
//
// The naming styles differ between the predictor dataset (research-PDF derived)
// and the microsite table (curated, maybe in shorter forms). We do a normalised
// fuzzy match: lowercase, strip non-alphanumeric, drop common stop-words like
// "college", "medical", "of", "the", etc., then match by exact normalized
// equality first, fall back to substring overlap.

import { supabase } from "../../../lib/supabase";

const STOP_WORDS = new Set([
  "college",
  "medical",
  "sciences",
  "institute",
  "university",
  "of",
  "the",
  "and",
  "for",
  "research",
  "hospital",
  "school",
  "centre",
  "center",
  "govt",
  "government",
  "new",
  "dr",
  "dr.",
  "sir",
  "smt",
  "shri",
  "swami",
  "bhagwan",
]);

export function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((tok) => tok.length > 0 && !STOP_WORDS.has(tok))
    .join("");
}

interface MicrositeRow {
  slug: string;
  college_name: string;
}

interface CachedEntry {
  norm: string;
  slug: string;
  raw: string;
}

let _cache: CachedEntry[] | null = null;
let _inflight: Promise<CachedEntry[]> | null = null;

async function loadAll(): Promise<CachedEntry[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    // Page through Supabase if needed; default cap is 1000 rows but our table
    // can be larger.  We only need slug + college_name.
    const all: MicrositeRow[] = [];
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("college_microsites")
        .select("slug, college_name")
        .range(from, from + PAGE - 1);
      if (error || !data || data.length === 0) break;
      all.push(...(data as MicrositeRow[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
    const built: CachedEntry[] = all
      .filter((r) => r.slug && r.college_name)
      .map((r) => ({
        norm: normalize(r.college_name),
        slug: r.slug,
        raw: r.college_name,
      }));
    _cache = built;
    return built;
  })();

  return _inflight;
}

/**
 * Given a list of predictor college names, return a Map of name → slug for
 * those that exist in college_microsites.  Names with no microsite are absent.
 */
export async function resolveMicrositeSlugs(
  names: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (names.length === 0) return result;

  let lookup: NonNullable<typeof _cache>;
  try {
    lookup = await loadAll();
  } catch {
    return result; // fail-soft: every tile becomes non-clickable
  }

  // Build exact-match index
  const byNorm = new Map<string, string>();
  for (const row of lookup) {
    if (!byNorm.has(row.norm)) byNorm.set(row.norm, row.slug);
  }

  for (const name of names) {
    const norm = normalize(name);
    if (!norm) continue;

    const exact = byNorm.get(norm);
    if (exact) {
      result.set(name, exact);
      continue;
    }

    // Substring fallback: predictor name contained in microsite name, or vice
    // versa. Require at least 8 chars overlap to avoid spurious matches.
    let matched: string | null = null;
    for (const row of lookup) {
      if (row.norm.length < 8 || norm.length < 8) continue;
      if (row.norm.includes(norm) || norm.includes(row.norm)) {
        matched = row.slug;
        break;
      }
    }
    if (matched) result.set(name, matched);
  }

  return result;
}
