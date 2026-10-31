// Facts pulled from a B-school's microsite tables (fees, placement, cutoff,
// admission) so MBA pages can carry unique, data-backed text, FAQs and
// structured data instead of the same template copy on every college.
// Every value is optional: only facts that are clearly labelled in the data
// are returned, so nothing is guessed.

import { cleanLocation } from "./collegeSeo"
import { IIM_CUTOFFS } from "./iimCutoffs"

type Table = { heading?: string; headers?: any; rows?: any[] }

export interface MbaFacts {
  name: string
  slug: string
  /** Exams found in the college's own tables, most important first. */
  exams: string[]
  /** "MBA", "PGDM", "MMS" or "PGP": the flagship programme name used in the data. */
  course: string
  fee?: { course: string; value: string }
  highest?: string
  average?: string
  median?: string
  placementLabel?: string
  recruiters: string[]
  city: string
  state: string
  location: string
  website?: string
  scholarship?: string
  selection?: string
  iimCutoff?: { overall: number | null; varc: number | null; dilr: number | null; qa: number | null; cycle: string }
}

export const CAT_2026_DATE = "29 November 2026"

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Chandigarh", "Puducherry",
]

// Most important first; the first exam found becomes the "primary" exam in titles.
const EXAMS: [string, RegExp][] = [
  ["CAT", /\bCAT\b/],
  ["XAT", /\bXAT\b/],
  ["SNAP", /\bSNAP\b/],
  ["NMAT", /\bNMAT\b/],
  ["GMAT", /\bGMAT\b/],
  ["MAH-CET", /\bMAH[\s-]*(MBA[\s-]*)?CET\b|\bMAHCET\b|\bMBA[\s-]*CET\b/i],
  ["CMAT", /\bCMAT\b/],
  ["MAT", /\bMAT\b/],
  ["ATMA", /\bATMA\b/],
  ["TANCET", /\bTANCET\b/],
  ["KMAT", /\bKMAT\b/],
  ["OJEE", /\bOJEE\b/],
  ["TS ICET", /\bTS[\s-]*ICET\b/i],
  ["AP ICET", /\bAP[\s-]*ICET\b/i],
  ["PGCET", /\bPGCET\b/i],
]

const MONEY = /(₹|INR|Rs\.?|Lakh|Lac|LPA|Cr\b|\d{1,3}(,\d{2,3})+)/i
const EMPTY = /^(-|—|–|n\/?a|na|null|undefined|not available)?$/i

function rowsOf(t: Table): string[][] {
  return (t?.rows || [])
    .map((r: any) => (Array.isArray(r) ? r : r?.base_data || []))
    .filter((r: any) => Array.isArray(r) && r.length > 0)
    .map((r: any[]) => r.map((c) => (c === null || c === undefined ? "" : String(c).replace(/Compare$/i, "").trim())))
}

function tables(college: any, micro: any, key: string): Table[] {
  const v = micro?.[key] ?? college?.[key]
  return Array.isArray(v) ? v : []
}

function clean(v: string | undefined): string | undefined {
  const s = (v || "").replace(/\s+/g, " ").trim()
  return EMPTY.test(s) ? undefined : s
}

export function parseMicrosite(college: any): any {
  const raw = typeof college?.microsite_data === "string" ? safeJson(college.microsite_data) : college?.microsite_data
  if (!raw || Array.isArray(raw)) return college || {}
  return { ...college, ...raw }
}

function safeJson(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

export function splitLocation(location: unknown): { city: string; state: string } {
  const loc = cleanLocation(location)
  const state = STATES.find((s) => new RegExp(`\\b${s}\\b`, "i").test(loc)) || ""
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean)
  const city = parts.find((p) => p.toLowerCase() !== state.toLowerCase() && p.length < 40) || ""
  return { city, state }
}

export function detectExams(college: any, micro: any): string[] {
  const text = ["cutoff", "admission", "fees", "courses"]
    .map((k) => JSON.stringify(micro?.[k] ?? college?.[k] ?? ""))
    .join(" ")
  return EXAMS.filter(([, re]) => re.test(text)).map(([e]) => e)
}

function detectCourse(raw: string): string {
  // "MAH MBA CET" is an exam name, not the programme
  const text = raw.replace(/MBA[\s-]*CET/gi, "")
  if (/\bPGDM\b/.test(text) && !/\bMBA\b/.test(text)) return "PGDM"
  if (/\bM\.?M\.?S\b/.test(text) && !/\bMBA\b/.test(text)) return "MMS"
  if (/\bPGP\b/.test(text) && !/\bMBA\b/.test(text)) return "PGP"
  return "MBA"
}

const FLAGSHIP = /\b(MBA|PGDM|M\.?M\.?S|PGP|PGDBM|PGDBA|PGPM|EPGP)\b/i

export function getMbaFacts(college: any): MbaFacts {
  const micro = parseMicrosite(college)
  const slug: string = college?.slug || ""
  const name: string = college?.college_name || ""

  // Fees: first flagship-course row with a money value.
  let fee: MbaFacts["fee"]
  for (const t of tables(college, micro, "fees")) {
    for (const r of rowsOf(t)) {
      if (!FLAGSHIP.test(r[0] || "")) continue
      const v = r.slice(1).find((c) => MONEY.test(c) && /\d/.test(c))
      if (v) {
        fee = { course: r[0].replace(/\s+/g, " ").slice(0, 60), value: dedupeRange(v) }
        break
      }
    }
    if (fee) break
  }

  // Placement: rows labelled highest / average / median with a money value.
  let highest: string | undefined, average: string | undefined, median: string | undefined, placementLabel: string | undefined
  const placement = tables(college, micro, "placement")
  for (const t of placement) {
    const hdr: string[] = Array.isArray(t.headers) ? t.headers.map(String) : []
    for (const r of rowsOf(t)) {
      const k = (r[0] || "").toLowerCase()
      const v = r.slice(1).find((c) => MONEY.test(c) && /\d/.test(c))
      if (!v) continue
      const col = r.indexOf(v)
      if (/highest|maximum/.test(k) && !highest) { highest = clean(v); placementLabel ||= clean(hdr[col]) }
      else if (/average|mean/.test(k) && !average) { average = clean(v); placementLabel ||= clean(hdr[col]) }
      else if (/median/.test(k) && !median) median = clean(v)
    }
  }
  if (placementLabel && /metric|particular|parameter|statistic/i.test(placementLabel)) placementLabel = undefined

  const recTable = placement.find((t) => /recruit|compan/i.test(`${t.heading} ${JSON.stringify(t.headers || "")}`))
  const recruiters = recTable
    ? Array.from(new Set(rowsOf(recTable).flat().map((c) => c.trim()).filter((c) => c.length > 2 && c.length < 40 && !EMPTY.test(c) && !/^\d/.test(c))))
        .slice(0, 8)
    : []

  // Admission quick-info rows (same labels the overview page reads).
  const adm = rowsOf(tables(college, micro, "admission")[0] || {})
  const pick = (re: RegExp) => clean(adm.find((r) => re.test((r[0] || "").toLowerCase()))?.[1])
  const scholarship = pick(/scholarship/)
  const selection = pick(/selection|basis|process/)

  const exams = detectExams(college, micro)
  const allText = JSON.stringify([micro?.fees, micro?.courses, micro?.admission, name])
  const { city, state } = splitLocation(college?.location)

  let website: string | undefined
  if (typeof college?.url === "string" && /^https?:\/\//.test(college.url.trim()) && !/collegedunia|shiksha|careers360/i.test(college.url)) {
    website = college.url.trim()
  }

  const iim = IIM_CUTOFFS.find((e) => e.slug === slug)
  const iimCutoff = iim?.cutoffs.General ? { ...iim.cutoffs.General, cycle: iim.cycle } : undefined

  return {
    name,
    slug,
    exams: iim && !exams.includes("CAT") ? ["CAT", ...exams] : exams,
    course: detectCourse(allText),
    fee,
    highest,
    average,
    median,
    placementLabel,
    recruiters,
    city,
    state,
    location: cleanLocation(college?.location),
    website,
    scholarship,
    selection,
    iimCutoff,
  }
}

/** "₹ 22.27 Lakhs - ₹ 22.27 Lakhs" -> "₹ 22.27 Lakhs" */
export function dedupeRange(v: string): string {
  const s = v.replace(/\s+/g, " ").trim()
  const parts = s.split(/\s+-\s+/)
  return parts.length === 2 && parts[0] === parts[1] ? parts[0] : s
}

export function examList(exams: string[], max = 4): string {
  const e = exams.slice(0, max)
  if (e.length <= 1) return e[0] || "CAT"
  return `${e.slice(0, -1).join(", ")} and ${e[e.length - 1]}`
}

export type MbaSection = "overview" | "cutoff" | "course-and-fees" | "placement" | "admission" | "ranking" | "reviews" | "contact"

export interface Faq {
  q: string
  a: string
}

/** Short, data-backed Q&A for one section. Questions without data are left out. */
export function buildMbaFaqs(f: MbaFacts, section: MbaSection): Faq[] {
  const n = f.name
  const c = f.course
  const exams = f.exams.length ? examList(f.exams) : ""
  const pkgParts = [f.average && `an average package of ${f.average}`, f.median && `a median of ${f.median}`, f.highest && `a highest package of ${f.highest}`].filter(Boolean) as string[]
  const pkg = pkgParts.length > 1 ? `${pkgParts.slice(0, -1).join(", ")} and ${pkgParts[pkgParts.length - 1]}` : pkgParts[0] || ""
  const pkgFor = f.placementLabel ? ` for ${f.placementLabel}` : ""
  const where = [f.city, f.state].filter(Boolean).join(", ")

  const q = {
    exams: exams && { q: `Which entrance exams does ${n} accept for ${c} admission 2027?`, a: `${n} accepts ${exams} scores for its ${c} programme (2027-29 batch), as listed in its admission data. CAT 2026 is on ${CAT_2026_DATE}.` },
    fee: f.fee && { q: `What is the total ${c} fee at ${n}?`, a: `The total fee for ${f.fee.course} at ${n} is ${f.fee.value}. Check the course and fees page for the year-wise break-up and hostel charges.` },
    pkg: pkg && { q: `What is the average package at ${n}?`, a: `${n} reported ${pkg}${pkgFor} in its latest placement report.` },
    recruiters: f.recruiters.length >= 3 && { q: `Which companies recruit from ${n}?`, a: `Recruiters listed for ${n} include ${f.recruiters.slice(0, 6).join(", ")}.` },
    iim: f.iimCutoff && f.iimCutoff.overall && {
      q: `What is the minimum CAT percentile for ${n}?`,
      a: `For General category candidates, ${n} requires at least ${f.iimCutoff.overall} percentile overall in CAT${[f.iimCutoff.varc, f.iimCutoff.dilr, f.iimCutoff.qa].some((x) => x) ? ` with sectional minimums of ${f.iimCutoff.varc ?? "-"} (VARC), ${f.iimCutoff.dilr ?? "-"} (DILR) and ${f.iimCutoff.qa ?? "-"} (QA)` : ""} (${f.iimCutoff.cycle} admission policy). These are shortlisting minimums; actual final cutoffs are usually higher.`,
    },
    cutoffWhen: { q: `When will ${n} release its ${f.exams[0] || "CAT"} cutoff for 2027-29?`, a: `${n} publishes shortlisting cutoffs after the ${f.exams[0] || "CAT"} results. CAT 2026 is on ${CAT_2026_DATE}; until the new cutoffs are out, use the previous year's cutoffs on this page to judge your chances.` },
    where: where && { q: `Where is ${n} located?`, a: `${n} is located in ${where}.` },
    scholarship: f.scholarship && { q: `Does ${n} offer scholarships?`, a: `Scholarship availability at ${n}: ${f.scholarship}.` },
    selection: f.selection && { q: `What is the ${c} selection process at ${n}?`, a: `Admission basis at ${n}: ${f.selection}.` },
  }

  const order: Record<MbaSection, (keyof typeof q)[]> = {
    overview: ["exams", "fee", "pkg", "iim", "where"],
    cutoff: ["iim", "exams", "cutoffWhen"],
    "course-and-fees": ["fee", "scholarship", "exams"],
    placement: ["pkg", "recruiters", "fee"],
    admission: ["exams", "selection", "fee", "cutoffWhen"],
    ranking: ["pkg", "exams", "where"],
    reviews: ["pkg", "fee", "where"],
    contact: ["where", "exams"],
  }
  return order[section].map((k) => q[k]).filter((x): x is Faq => !!x)
}
