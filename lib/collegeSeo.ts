// MBA-aware SEO metadata for /college/[slug]/* pages.
// CAT 2026 is on 29 Nov 2026; these pages target the 2027-29 MBA batch.
// Well-known B-school short names (word-bounded)
const B_SCHOOL_ACRONYM =
  /\b(IIM|PGDM|MBA|B-?School|XLRI|SPJIMR|NMIMS|JBIMS|MDI|IMT|IMI|FORE|BIMTECH|TAPMI|IIFT|SIBM|SCMHRD|IRMA|MICA|SJMSoM|VGSoM|LIBA|KJSIM|JAGSoM|GIM|IFMR|XIM|XIMB|XIME|IBS|SIIB|NDIM|GLIM|LBSIM|FSM|FMS|SIMS|IILM|IFIM|VBS|Welingkar)\b/

const BUSINESS_NAME =
  /indian institute of management|business school|school of business|business academy|international business|business management|business administration|business studies|business economics/i

// "Management" in these contexts is not an MBA school
const NON_MBA_MANAGEMENT =
  /hotel management|event management|health management|hospital|pharmacy|medical|dental|nursing|ayurved|homoeopath|physiotherapy|\blaw\b|polytechnic|commerce and management|university/i

const MANAGEMENT_SCHOOL = /faculty of management|school of management|management studies|centre for management/i

/** True for B-schools / management institutes, false for universities and engineering colleges that merely offer an MBA. */
export function isManagementCollege(slug: string, name: string | null | undefined): boolean {
  const n = name || ""
  if (/^iim-/.test(slug) || B_SCHOOL_ACRONYM.test(n) || BUSINESS_NAME.test(n)) return true
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

/** MBA-season title/description for a management college page, or null for other colleges. */
export function mbaMeta(section: Section, slug: string, name: string, location: unknown) {
  if (!isManagementCollege(slug, name)) return null
  const loc = cleanLocation(location)
  const inLoc = loc ? ` in ${loc}` : ""
  const path = section === "overview" ? "" : `/${section}`
  let title: string
  let description: string
  switch (section) {
    case "cutoff":
      title = `${name} CAT Cutoff 2026: Percentile, Sectional & Category-wise Cutoff`
      description = `${name} CAT cutoff 2026 for MBA/PGDM 2027-29: overall and sectional (VARC, DILR, QA) percentiles, category-wise cutoffs, previous-year trends and XAT/CMAT/MAT cutoffs where accepted.`
      break
    case "course-and-fees":
      title = `${name} MBA Fees 2027-29: Total Fee Structure, Courses & Hostel`
      description = `${name} MBA/PGDM fees for the 2027-29 batch: total programme fee, year-wise fee structure, hostel charges, courses offered and scholarships${inLoc}.`
      break
    case "placement":
      title = `${name} MBA Placements 2026: Average & Highest Package, Top Recruiters`
      description = `${name} MBA/PGDM placement report: average and median CTC, highest package, top recruiters, sector-wise offers and summer internship stipends${inLoc}.`
      break
    case "admission":
      title = `${name} Admission 2027: MBA/PGDM Application Form, Last Date, Fees & Cutoff`
      description = `${name} MBA/PGDM admission 2027-29: application form, last date, exams accepted (CAT, XAT, CMAT, MAT), fees, cutoff and selection process${inLoc}.`
      break
    case "ranking":
      title = `${name} MBA Ranking 2026: NIRF Management Rank & Other Rankings`
      description = `${name} MBA ranking: NIRF Management rank, business-school rankings and how it compares with other B-schools${inLoc}.`
      break
    default:
      title = `${name}: MBA Fees, CAT Cutoff 2026, Placements & Admission 2027`
      description = `${name}${inLoc}: MBA/PGDM fees, CAT cutoff 2026, average package, admission 2027-29 process, rankings and student reviews.`
  }
  const url = `https://www.getedunext.com/college/${slug}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  }
}
