// Shared college-ranking logic for EduNext.
// Mirrors the ranking system used in /find-colleges (card_detail.ranking),
// so /best-colleges pages rank colleges the same way (NIRF > EduNext > QS ...).
// Nothing here is hard-coded per college — ranks come from card_detail.ranking.

export interface RankingRow { value: number; category: string }
export interface RankingEntry { heading: string; rows: RankingRow[] }
export interface TopRanking { source: string; category: string; value: number }

export const RANKING_PRIORITY: string[] = [
  "NIRF Ranking",
  "EduNext Ranking",
  "QS Ranking",
  "Indiatoday Ranking",
  "The Week Ranking",
  "Outlook Ranking",
  "IIRF Ranking",
  "TOI Ranking",
]

// course (canonical) -> ranking category present in card_detail.ranking
export const COURSE_TO_RANKING_CATEGORY: Record<string, string> = {
  MBA: "MBA",
  "B.Tech": "B.Tech",
  "B.E": "B.Tech",
  BBA: "BBA/BMS",
  BCA: "BCA",
  MCA: "Computer Applications",
  "B.Com": "Commerce",
  "M.Com": "Commerce",
  "B.Sc": "Science",
  "M.Sc": "Science",
  "B.A": "Arts",
  "M.A": "Arts",
  "LL.B": "Law",
  "LL.M": "Law",
  "B.Pharm": "Pharmacy",
  "B.Pharma": "Pharmacy",
  "M.Pharm": "Pharmacy",
  "B.Arch": "Architecture",
  "M.Arch": "Architecture",
  "B.Ed": "Education",
  "M.Ed": "Education",
  "M.Tech": "B.Tech",
  "M.E": "B.Tech",
  Diploma: "B.Tech",
  // medical (extends find-colleges defaults; "Medical" is a valid ranking category)
  MBBS: "Medical",
  MD: "Medical",
  "M.D": "Medical",
  "B.Sc Nursing": "Medical",
  "B.Sc (Nursing)": "Medical",
  Nursing: "Medical",
  PhD: "Overall",
  "Ph.D": "Overall",
}

// exam (canonical) -> ranking category, used for exam/city pages that have no course
export const EXAM_TO_RANKING_CATEGORY: Record<string, string> = {
  CAT: "MBA", CMAT: "MBA", TSICET: "MBA", "Karnataka PGCET": "MBA",
  "JEE Main": "B.Tech", JEECUP: "B.Tech", GATE: "B.Tech", "MHT-CET": "B.Tech",
  KCET: "B.Tech", TNEA: "B.Tech", TANCET: "B.Tech", "AP EAPCET": "B.Tech",
  "TS EAMCET": "B.Tech", KEAM: "B.Tech", UPTAC: "B.Tech", GUJCET: "B.Tech",
  HSTES: "B.Tech", WBJEE: "B.Tech", OJEE: "B.Tech",
  NEET: "Medical", "NEET PG": "Medical",
  CLAT: "Law", "MH CET Law": "Law",
  NATA: "Architecture", "MAH BEd CET": "Education",
  CUET: "Overall", "CUET PG": "Overall", "IPU CET": "Overall", "NCHMCT JEE": "Overall",
}

export function findRankingCategory(courseName: string): string | null {
  if (COURSE_TO_RANKING_CATEGORY[courseName]) return COURSE_TO_RANKING_CATEGORY[courseName]
  const normalized = courseName.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()
  for (const [key, value] of Object.entries(COURSE_TO_RANKING_CATEGORY)) {
    const keyNorm = key.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()
    if (keyNorm === normalized) return value
  }
  return null
}

// Decide which ranking category a /best-colleges page should rank by.
export function resolveCategory(course?: string | null, exam?: string | null): string {
  if (course) {
    const c = findRankingCategory(course)
    if (c) return c
  }
  if (exam && EXAM_TO_RANKING_CATEGORY[exam]) return EXAM_TO_RANKING_CATEGORY[exam]
  return "Overall"
}

function isRankingArray(ranking: any): ranking is RankingEntry[] {
  return Array.isArray(ranking) && ranking.length > 0 && "heading" in ranking[0]
}

export function getRankingsByCategory(
  ranking: RankingEntry[] | string | null | undefined,
  category: string
): TopRanking[] {
  if (!ranking || typeof ranking === "string" || !isRankingArray(ranking)) return []
  const rankings: TopRanking[] = []
  const seen = new Set<string>()
  const map = new Map<string, RankingEntry>()
  for (const entry of ranking) {
    if (entry.heading && Array.isArray(entry.rows) && entry.rows.length > 0) map.set(entry.heading, entry)
  }
  for (const heading of RANKING_PRIORITY) {
    const entry = map.get(heading)
    if (entry) {
      const row = entry.rows?.find((r) => r.category === category)
      if (row && !seen.has(heading)) {
        rankings.push({ source: heading.replace(/ Ranking$/i, ""), category, value: Number(row.value) })
        seen.add(heading)
      }
    }
  }
  for (const entry of ranking) {
    if (entry.heading && !seen.has(entry.heading)) {
      const row = entry.rows?.find((r) => r.category === category)
      if (row) {
        rankings.push({ source: entry.heading.replace(/ Ranking$/i, ""), category, value: Number(row.value) })
        seen.add(entry.heading)
      }
    }
  }
  return rankings
}

// Sort colleges: those ranked in `category` first (by source priority, then rank value),
// the rest after, by rating desc. Returns a new array.
export function sortByRanking<T extends { card_detail?: any; rating?: number | null }>(
  colleges: T[],
  category: string
): T[] {
  const decorated = colleges.map((c) => {
    const r = getRankingsByCategory(c.card_detail?.ranking, category)
    const top = r.length ? r[0] : null
    let priority = 999
    if (top) {
      const idx = RANKING_PRIORITY.findIndex((p) => p.toLowerCase().includes(top.source.toLowerCase()))
      priority = idx < 0 ? 998 : idx
    }
    return { c, hasRank: !!top, priority, value: top ? Number(top.value) : Infinity }
  })
  decorated.sort((a, b) => {
    if (a.hasRank && b.hasRank) {
      if (a.priority !== b.priority) return a.priority - b.priority
      return a.value - b.value
    }
    if (a.hasRank) return -1
    if (b.hasRank) return 1
    return (b.c.rating ?? -1) - (a.c.rating ?? -1)
  })
  return decorated.map((d) => d.c)
}

// Human-readable rank badge for a college in a category, e.g. "NIRF MBA #2".
export function rankLabelFor(college: { card_detail?: any }, category: string): string | null {
  const r = getRankingsByCategory(college.card_detail?.ranking, category)
  if (r.length) return `${r[0].source} ${category} #${r[0].value}`
  return null
}
