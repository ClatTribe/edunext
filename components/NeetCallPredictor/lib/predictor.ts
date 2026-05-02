// Pure prediction logic — no React, no Supabase, no DOM. Easy to test.

import type { Category, College } from "../data/colleges";
import { COLLEGES } from "../data/colleges";

export type Bucket = "safe" | "moderate" | "reach";
export type Pool = "AIQ" | "STATE";

export interface Match {
  college: College;
  /** The closing AIR that justified the match (lowest applicable). */
  cutoffAir: number;
  /** Which counselling pool the match came from. */
  pool: Pool;
  /** userAir / cutoffAir. <0.7 safe; 0.7–0.95 moderate; >0.95 reach. */
  ratio: number;
  bucket: Bucket;
}

// Multipliers for category fallback when granular data is missing.
// Source: research PDF — stable within ~10% across tiers.
const CAT_MULT: Record<Category, number> = {
  ur: 1,
  ews: 1.3,
  obc: 1.5,
  sc: 8,
  st: 15,
};

/** Resolve the closing AIR for a category from a quota's CategoryAir block. */
function expectedAir(
  c: College,
  cat: Category,
  pool: "aiq" | "state",
): number | null {
  const data = pool === "aiq" ? c.aiq : c.state_quota;
  if (!data) return null;
  const direct = data[cat];
  if (typeof direct === "number") return direct;
  if (typeof data.ur === "number") {
    return Math.round((data.ur * CAT_MULT[cat]) / CAT_MULT.ur);
  }
  return null;
}

const SAFE_THRESHOLD = 0.7;
const MODERATE_THRESHOLD = 0.95;
const REACH_THRESHOLD = 1.15; // include calls slightly above cutoff (stray rounds)

export interface PredictInput {
  userAir: number;
  category: Category;
  domicileState: string;
}

/**
 * Run the full predictor.
 *
 * For each college:
 *   - Always check AIQ pool (open to all).
 *   - If domicile state matches the college's state, also check state-quota pool.
 *   - Match if userAir <= cutoff * REACH_THRESHOLD.
 *   - Pick the BEST (lowest cutoff AIR) winning pool — that's the harder pool
 *     to get into, so it's the most valuable signal.
 *
 * Returns matches sorted: bucket asc (safe → reach), then cutoff AIR asc.
 */
export function predict({
  userAir,
  category,
  domicileState,
}: PredictInput): Match[] {
  const matches: Match[] = [];

  for (const college of COLLEGES) {
    let best: { cutoff: number; pool: Pool } | null = null;

    // AIQ pool — accessible to all
    const aiqAir = expectedAir(college, category, "aiq");
    if (aiqAir !== null && userAir <= aiqAir * REACH_THRESHOLD) {
      best = { cutoff: aiqAir, pool: "AIQ" };
    }

    // State quota — only if user's domicile matches this college's state
    if (college.state === domicileState) {
      const sqAir = expectedAir(college, category, "state");
      if (sqAir !== null && userAir <= sqAir * REACH_THRESHOLD) {
        if (!best || sqAir < best.cutoff) {
          best = { cutoff: sqAir, pool: "STATE" };
        }
      }
    }

    if (!best) continue;

    const ratio = userAir / best.cutoff;
    const bucket: Bucket =
      ratio <= SAFE_THRESHOLD
        ? "safe"
        : ratio <= MODERATE_THRESHOLD
          ? "moderate"
          : "reach";

    matches.push({
      college,
      cutoffAir: best.cutoff,
      pool: best.pool,
      ratio,
      bucket,
    });
  }

  const bucketOrder: Record<Bucket, number> = { safe: 0, moderate: 1, reach: 2 };

  return matches.sort((a, b) => {
    const bo = bucketOrder[a.bucket] - bucketOrder[b.bucket];
    if (bo !== 0) return bo;
    return a.cutoffAir - b.cutoffAir;
  });
}
