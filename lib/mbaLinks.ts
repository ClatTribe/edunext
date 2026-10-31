// Internal-link data for the MBA cluster: hub pages, MBA blog posts and a
// name -> microsite map used to link B-school mentions in blog posts.
// Slugs were checked against the live /college-sitemaps on 31 Oct 2026.

export interface NavLink {
  href: string
  label: string
}

/** MBA hubs and tools, linked from every B-school microsite and MBA blog. */
export const MBA_HUBS: NavLink[] = [
  { href: "/iim-cutoff", label: "IIM cutoff 2026: CAT percentile for all 22 IIMs" },
  { href: "/mba-colleges-by-cat-percentile", label: "MBA colleges by CAT percentile" },
  { href: "/cat-college-predictor", label: "CAT college predictor" },
  { href: "/cat-percentile-predictor", label: "CAT percentile predictor" },
  { href: "/forms-and-deadlines/mba", label: "MBA application forms 2027 and last dates" },
  { href: "/cat-admit-card", label: "CAT 2026 admit card" },
]

/** MBA blog posts (content/blogs). Keep in sync when MBA posts are added or merged. */
export const MBA_BLOGS: NavLink[] = [
  { href: "/blogs/tier-1-tier-2-tier-3-mba-colleges-in-india", label: "Tier 1, Tier 2 and Tier 3 MBA colleges in India" },
  { href: "/blogs/top-50-mba-colleges-in-india-nirf-2025-rankings-fees-placements-guides", label: "Top 50 MBA colleges in India (NIRF)" },
  { href: "/blogs/top-20-mba-colleges-in-india-nirf-2025-rankings", label: "Top 20 MBA colleges in India (NIRF)" },
  { href: "/blogs/top-10-b-schools-india-rankings-fees-placements", label: "Top 10 B-schools in India: fees and placements" },
  { href: "/blogs/cat-2026-admit-card-exam-day-plan-test-centres-score", label: "CAT 2026 admit card and exam-day plan" },
  { href: "/blogs/top-colleges-accepting-cmat-score-india", label: "Top colleges accepting CMAT scores" },
  { href: "/blogs/cmat-2026-exam-dates-admit-card-pattern-top-colleges", label: "CMAT exam dates, pattern and colleges" },
  { href: "/blogs/new-age-b-schools-2026-masters-union-vs-mesa-vs-first-bridge-fees-programs-are-they-worth-it", label: "New-age B-schools: Masters' Union vs Mesa vs First Bridge" },
  { href: "/blogs/is-an-online-mba-worth-it-in-india-in-2027", label: "Is an online MBA worth it in 2027?" },
  { href: "/blogs/xat-response-sheet-2026-download-link-calculate-score", label: "XAT response sheet and score calculation" },
]

/** True for blog posts that belong to the MBA cluster. */
export function isMbaBlog(slug: string, tags: string[] = []): boolean {
  if (MBA_BLOGS.some((b) => b.href === `/blogs/${slug}`)) return true
  const t = tags.join(" ")
  return /\b(MBA|PGDM|MMS|CAT|XAT|CMAT|NMAT|SNAP|IIM|B-?school)\b/i.test(t) || /(^|-)(mba|pgdm|cat|xat|cmat|nmat|snap|iim|b-schools?)(-|$)/.test(slug)
}

/**
 * B-school names as they are written in posts -> microsite slug.
 * Longer names come first so "XLRI Jamshedpur" wins over "XLRI".
 */
export const BSCHOOL_LINKS: [string, string][] = [
  ["IIM Ahmedabad", "iim-ahmedabad"],
  ["IIM Bangalore", "iim-bangalore"],
  ["IIM Calcutta", "iim-calcutta"],
  ["IIM Lucknow", "iim-lucknow"],
  ["IIM Kozhikode", "iim-kozhikode"],
  ["IIM Indore", "iim-indore"],
  ["IIM Mumbai", "iim-mumbai"],
  ["IIM Shillong", "iim-shillong"],
  ["IIM Rohtak", "iim-rohtak"],
  ["IIM Ranchi", "iim-ranchi"],
  ["IIM Raipur", "iim-raipur"],
  ["IIM Trichy", "iim-trichy"],
  ["IIM Tiruchirappalli", "iim-trichy"],
  ["IIM Udaipur", "iim-udaipur"],
  ["IIM Kashipur", "iim-kashipur"],
  ["IIM Nagpur", "iim-nagpur"],
  ["IIM Visakhapatnam", "iim-visakhapatnam"],
  ["IIM Bodh Gaya", "iim-bodh-gaya"],
  ["IIM Amritsar", "iim-amritsar"],
  ["IIM Sambalpur", "iim-sambalpur"],
  ["IIM Sirmaur", "iim-sirmaur"],
  ["IIM Jammu", "iim-jammu"],
  ["IIM Guwahati", "iim-guwahati"],
  ["XLRI Jamshedpur", "xlri-jamshedpur"],
  ["XLRI Delhi", "xlri-delhi"],
  ["XLRI", "xlri-jamshedpur"],
  ["SPJIMR", "spjimr"],
  ["JBIMS", "jbims-mumbai"],
  ["MDI Gurgaon", "mdi-gurgaon"],
  ["MDI Gurugram", "mdi-gurgaon"],
  ["MDI Murshidabad", "mdi-murshidabad"],
  ["FMS Delhi", "fms-delhi"],
  ["FMS BHU", "fms-bhu"],
  ["IIFT Delhi", "iift-delhi"],
  ["IIFT", "iift-delhi"],
  ["SIBM Pune", "sibm-pune"],
  ["SIBM Bangalore", "sibm-bangalore"],
  ["SIBM Bengaluru", "sibm-bangalore"],
  ["SIBM Hyderabad", "sibm-hyderabad"],
  ["SCMHRD", "scmhrd"],
  ["NMIMS Mumbai", "nmims-mumbai"],
  ["IMT Ghaziabad", "imt-ghaziabad"],
  ["IMI Delhi", "imi-delhi"],
  ["BIMTECH", "bimtech"],
  ["TAPMI", "tapmi-manipal"],
  ["GIM Goa", "gim-goa"],
  ["LIBA", "liba"],
  ["XIMB", "ximb"],
  ["XIME", "xime-bangalore"],
  ["MICA", "mica-ahmedabad"],
  ["SIIB", "siib-pune"],
  ["SJMSOM", "sjmsom"],
  ["VGSOM", "vgsom"],
  ["DMS, IIT Delhi", "dms-iit-delhi"],
  ["IFMR", "ifmr-gsb"],
  ["GLIM Chennai", "glim-chennai"],
  ["LBSIM", "lbsim-delhi"],
  ["Masters' Union", "masters-union"],
  ["Mesa School of Business", "mesa-school-of-business-bangalore"],
  ["First Bridge", "first-bridge-business-school-gurgaon"],
  ["Fostiima", "fostiima-business-school-new-delhi"],
]

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Links the first plain-text mention of each known B-school in rendered blog HTML.
 * Skips text inside <a>, headings, code and existing links, and never links the same
 * school twice. Returns the new HTML and the schools that were found.
 */
export function linkBSchools(html: string, maxLinks = 25): { html: string; found: { name: string; slug: string }[] } {
  const found: { name: string; slug: string }[] = []
  const seenSlugs = new Set<string>()
  const parts = html.split(/(<[^>]+>)/)
  let skipDepth = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith("<")) {
      const m = /^<(\/)?(a|h1|h2|h3|h4|h5|h6|code|pre|script|style)\b/i.exec(part)
      if (m) skipDepth = Math.max(0, skipDepth + (m[1] ? -1 : 1))
      continue
    }
    if (skipDepth > 0 || !part.trim() || found.length >= maxLinks) continue
    let text = part
    for (const [name, slug] of BSCHOOL_LINKS) {
      if (seenSlugs.has(slug) || found.length >= maxLinks) continue
      const re = new RegExp(`(^|[^A-Za-z0-9-])(${escapeRe(name).replace(/'/g, "['’]")})(?![A-Za-z0-9-])`)
      const m = re.exec(text)
      if (!m) continue
      const start = m.index + m[1].length
      const label = m[2]
      const anchor = `<a href="/college/${slug}">${label}</a>`
      // Split around the anchor so later names are never matched inside it.
      const before = text.slice(0, start)
      const after = text.slice(start + label.length)
      parts.splice(i, 1, before, anchor, after)
      seenSlugs.add(slug)
      found.push({ name, slug })
      i += 2 // continue scanning in "after"
      text = after
      // Re-run remaining names on the trailing text in the next loop iteration.
      i -= 1
      break
    }
  }
  return { html: parts.join(""), found }
}
