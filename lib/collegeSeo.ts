// MBA-aware SEO metadata for /college/[slug]/* pages.
// CAT 2026 is on 29 Nov 2026; these pages target the 2027-29 MBA batch.
// Well-known B-school short names (word-bounded)
const B_SCHOOL_ACRONYM =
  /\b(IIM|PGDM|MBA|B-?School|XLRI|SPJIMR|NMIMS|JBIMS|MDI|IMT|IMI|FORE|BIMTECH|TAPMI|IIFT|SIBM|SCMHRD|IRMA|MICA|SJMSoM|VGSoM|LIBA|KJSIM|JAGSoM|GIM|IFMR|XIM|XIMB|XIME|IBS|SIIB|NDIM|GLIM|LBSIM|FSM|FMS|SIMS|IILM|IFIM|VBS|Welingkar|SJMSOM|VGSOM|DoMS|DMS)\b/

const BUSINESS_NAME =
  /indian institute of management|masters.? union|shailesh j\.? mehta|vinod gupta school|department of management|business school|school of business|business academy|international business|business management|business administration|business studies|business economics/i

// "Management" in these contexts is not an MBA school
const NON_MBA_MANAGEMENT =
  /hotel management|event management|health management|hospital|pharmacy|medical|dental|nursing|ayurved|homoeopath|physiotherapy|\blaw\b|polytechnic|commerce and management|university/i

const MANAGEMENT_SCHOOL = /faculty of management|school of management|management studies|centre for management/i

/** True for B-schools / management institutes, false for universities and engineering colleges that merely offer an MBA. */
export function isManagementCollege(slug: string, name: string | null | undefined): boolean {
  const n = name || ""
  if (/^(iim-|dms-iit-)/.test(slug) || B_SCHOOL_ACRONYM.test(n) || BUSINESS_NAME.test(n)) return true
  const m = n.search(/management/i)
  if (m < 0) return false
  if (MANAGEMENT_SCHOOL.test(n)) return true
  if (NON_MBA_MANAGEMENT.test(n)) return false
  // "Institute of Technology and Management" = engineering; "Institute of Management and Technology" = MBA/PGDM
  const t = n.search(/technology|engineering/i)
  return t < 0 || m < t
}

/** Drops empty / "null" / "undefined" locations that leaked into titles ("admission eligibility in null"). */
export function cleanLocation(location: unknown): string {
  const s = typeof location === "string" ? location.trim() : ""
  return !s || /^(null|undefined|n\/a|-)$/i.test(s) ? "" : s
}

type Section = "overview" | "cutoff" | "course-and-fees" | "placement" | "admission" | "ranking"

/** Optional data from the college's own tables, used to make titles and descriptions specific. */
export interface MbaMetaFacts {
  exams?: string[]
  course?: string
  fee?: { value: string }
  average?: string
  highest?: string
  city?: string
  state?: string
}

/** MBA-season title/description for a management college page, or null for other colleges. */
export function mbaMeta(section: Section, slug: string, name: string, location: unknown, facts: MbaMetaFacts = {}) {
  if (!isManagementCollege(slug, name)) return null
  const loc = facts.city || facts.state ? [facts.city, facts.state].filter(Boolean).join(", ") : cleanLocation(location)
  const inLoc = loc ? ` in ${loc}` : ""
  const path = section === "overview" ? "" : `/${section}`
  const exams = facts.exams?.length ? facts.exams : ["CAT"]
  const exam = exams[0]
  const examsText = exams.slice(0, 4).join(", ")
  const course = facts.course === "MMS" ? "MMS (MBA)" : facts.course || "MBA"
  const fee = facts.fee?.value ? ` Total fee: ${facts.fee.value}.` : ""
  const pkg = facts.average ? ` Average package: ${facts.average}.` : facts.highest ? ` Highest package: ${facts.highest}.` : ""
  let title: string
  let description: string
  switch (section) {
    case "cutoff":
      title = `${name} Cutoff 2026: ${exam} Percentile, Sectional & Category-wise`
      description = `${name} ${exam} cutoff 2026 for ${course} 2027-29: overall and sectional percentiles, category-wise cutoffs and previous-year trends${exams.length > 1 ? ` (${examsText} accepted)` : ""}.`
      break
    case "course-and-fees":
      title = `${name} ${course} Fees 2027-29: Total Fee Structure, Courses & Hostel`
      description = `${name} ${course} fees for the 2027-29 batch.${fee} Year-wise fee structure, hostel charges, courses offered and scholarships${inLoc}.`
      break
    case "placement":
      title = `${name} ${course} Placements 2026: Average & Highest Package, Top Recruiters`
      description = `${name} ${course} placement report.${pkg}${facts.highest && facts.average ? ` Highest: ${facts.highest}.` : ""} Median CTC, top recruiters and summer internship stipends${inLoc}.`
      break
    case "admission":
      title = `${name} Admission 2027: ${course} Application Form, Last Date & ${exam} Cutoff`
      description = `${name} ${course} admission 2027-29: application form, last date, exams accepted (${examsText}), fees, cutoff and selection process${inLoc}.`
      break
    case "ranking":
      title = `${name} ${course} Ranking 2026: NIRF Management Rank & Other Rankings`
      description = `${name} ${course} ranking: NIRF Management rank, business-school rankings and how it compares with other B-schools${inLoc}.`
      break
    default:
      title = `${name}: ${course} Fees, ${exam} Cutoff 2026, Placements & Admission 2027`
      description = `${name}${inLoc}: ${course} fees, ${exam} cutoff 2026, placements and admission 2027-29.${fee}${pkg} Exams accepted: ${examsText}.`
  }
  const url = `https://www.getedunext.com/college/${slug}${path}`
  description = description.replace(/\.\./g, ".").replace(/\s+/g, " ").trim()
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  }
}
