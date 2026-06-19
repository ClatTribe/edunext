// Content + copy helpers for /best-colleges/<slug> pages.
// Kept out of page.tsx to keep that file small. All copy is dynamic
// (changes per course / city / exam) — no hard-coded facts.

export const SITE = "https://www.getedunext.com"
export const YEAR = 2026

export type PageRow = {
  slug: string
  tier: number
  page_type: string
  exam: string | null
  city: string | null
  course: string | null
  exam_slug: string | null
  city_slug: string | null
  course_slug: string | null
  college_count: number
  custom_title: string | null
  custom_description: string | null
  custom_intro: string | null
}

export type College = {
  slug: string
  college_name: string
  location: string | null
  rating: number | null
  review_count: number | null
  image: string | null
  card_detail: any
}

export type Faq = { q: string; a: string }

export function headingText(p: PageRow): string {
  const { exam, city, course } = p
  if (course && city && exam) return `Best ${course} Colleges in ${city} Accepting ${exam} ${YEAR}`
  if (course && city) return `Best ${course} Colleges in ${city} ${YEAR}`
  if (course && exam) return `Best ${course} Colleges Accepting ${exam} ${YEAR}`
  if (city && exam) return `Best Colleges in ${city} Accepting ${exam} ${YEAR}`
  if (exam) return `Best Colleges Accepting ${exam} ${YEAR}`
  if (city) return `Best Colleges in ${city} ${YEAR}`
  if (course) return `Best ${course} Colleges in India ${YEAR}`
  return `Best Colleges ${YEAR}`
}

export function relatedLabel(r: PageRow): string {
  if (r.course && r.city && r.exam) return `${r.course} colleges in ${r.city} (${r.exam})`
  if (r.course && r.city) return `${r.course} colleges in ${r.city}`
  if (r.course && r.exam) return `${r.course} colleges (${r.exam})`
  if (r.city && r.exam) return `Colleges in ${r.city} (${r.exam})`
  if (r.exam) return `${r.exam} colleges`
  if (r.city) return `Colleges in ${r.city}`
  if (r.course) return `${r.course} colleges`
  return r.slug
}

export function metaTitle(p: PageRow): string {
  return p.custom_title ?? `${headingText(p)} | Fees, Cutoff & Rankings`
}

export function metaDescription(p: PageRow): string {
  if (p.custom_description) return p.custom_description
  const what = p.course ? `${p.course} colleges` : "colleges"
  const where = p.city ? ` in ${p.city}` : ""
  const exam = p.exam ? ` accepting ${p.exam}` : ""
  return `Explore ${p.college_count}+ ${what}${where}${exam}. Compare fees, cutoffs, rankings, placements & reviews. Apply for ${YEAR}-27 admissions on EduNext.`
}

// Rich, page-specific intro (changes with course / city / exam combination)
export function introText(p: PageRow): string {
  if (p.custom_intro) return p.custom_intro
  const { course, city, exam } = p
  const what = course ? `${course} colleges` : "colleges"
  const where = city ? ` in ${city}` : ""
  const examAccept = exam ? ` accepting ${exam}` : ""

  let hook: string
  if (course && city && exam) hook = `Want to turn your ${exam} score into a top ${course} seat in ${city}?`
  else if (course && city) hook = `Planning to pursue ${course} in ${city} in ${YEAR}?`
  else if (course && exam) hook = `Looking for ${course} colleges that accept ${exam} for ${YEAR}?`
  else if (city && exam) hook = `Searching for colleges in ${city} that accept ${exam} in ${YEAR}?`
  else if (exam) hook = `Want to know which colleges accept ${exam} for ${YEAR} admissions?`
  else if (city) hook = `Looking for the best colleges in ${city} for ${YEAR}?`
  else if (course) hook = `Planning to pursue ${course} in ${YEAR}?`
  else hook = `Looking for the best colleges for ${YEAR}?`

  const listLine = `We have curated ${p.college_count} verified ${what}${where}${examAccept}, ranked using NIRF, EduNext and other trusted rankings so the strongest institutes show up first.`

  const cutoffs = exam ? `${exam} cutoffs` : "entrance cutoffs"
  const valueLine = `For each one you can compare total fees, eligibility, ${cutoffs}, placement records and real student reviews — and apply for ${YEAR}-27 admissions with zero spam calls.`

  return `${hook} ${listLine} ${valueLine}`
}

export function overviewSection(p: PageRow, top: string[]): { heading: string; paras: string[] } {
  const { course, city, exam } = p
  const what = course ? `${course} colleges` : "colleges"
  const inCity = city ? ` in ${city}` : ""
  const heading = `About ${course ? `${course} ` : ""}Colleges${city ? ` in ${city}` : ""} (${YEAR})`
  const paras: string[] = []

  paras.push(
    `${city ? `${city} is home to` : "India has"} ${p.college_count} ${what}${exam ? ` that accept ${exam}` : ""} for the ${YEAR} academic session, spanning government institutes, deemed universities and private colleges. The list above is ordered using NIRF, EduNext and other recognised rankings, so the strongest options appear first and you can compare them at a glance.`
  )

  if (exam) {
    paras.push(
      `Admission to most of these colleges is through ${exam}. Your ${exam} score and category rank decide which colleges and seats you are eligible for, so it is wise to shortlist a mix of ambitious, realistic and safe choices. Every college page lists its accepted entrance exams along with the latest cutoff trends.`
    )
  } else if (course) {
    paras.push(
      `Admission to ${course} programmes${inCity} is usually based on merit or a relevant entrance exam, followed by counselling. Eligibility and selection criteria differ slightly from college to college, so always confirm the exact requirements on each college's admission page.`
    )
  }

  paras.push(
    `Before you apply, compare each college on the factors that matter most — total course fees, eligibility, entrance cutoffs, placement records and verified student reviews${top.length ? `. Popular choices here include ${top.slice(0, 3).join(", ")}` : ""}. Open any college above for its full profile, or share your details in the enquiry form to get free, unbiased admission guidance with zero spam calls.`
  )

  return { heading, paras }
}

export function buildFaqs(p: PageRow, colleges: College[]): Faq[] {
  const course = p.course
  const what = course ? `${course} colleges` : "colleges"
  const where = p.city ? ` in ${p.city}` : ""
  const exam = p.exam ? ` accepting ${p.exam}` : ""
  const top = colleges.slice(0, 5).map((c) => c.college_name).filter(Boolean)
  const faqs: Faq[] = []

  faqs.push({
    q: `How many ${what} are there${where}${exam}?`,
    a: `There are ${p.college_count} ${what}${where}${exam} listed on EduNext for ${YEAR} admissions, ranked using NIRF and EduNext rankings.`,
  })

  if (top.length) {
    faqs.push({
      q: `Which are the best ${what}${where}${exam}?`,
      a: `Some of the top-ranked options are ${top.join(", ")}. The full ranked list with fees, cutoffs and reviews is shown above.`,
    })
  }

  if (p.exam) {
    faqs.push({
      q: `Do these colleges accept ${p.exam} scores?`,
      a: `Yes. Every college listed here considers ${p.exam}${course ? ` for admission to its ${course} programme` : ""}. Check each college page for its latest ${p.exam} cutoff before applying.`,
    })
  }

  faqs.push({
    q: `What are the fees for ${what}${where}?`,
    a: `Fees vary widely by college, category and quota. Government colleges are usually the most affordable, while private universities cost more. Open any college above to see its exact ${YEAR} fee structure.`,
  })

  faqs.push({
    q: `What is the eligibility for ${course ?? "these"} ${course ? "programmes" : "colleges"}${where}?`,
    a: `Eligibility depends on the college and course level. You will find the exact qualifying marks, required subjects and entrance criteria on each college's admission page.`,
  })

  faqs.push({
    q: `How can I apply to ${what}${where}?`,
    a: `Open any college above to see its admission process, important dates and eligibility, or fill the enquiry form on this page and our counsellors will guide you through the application for free.`,
  })

  return faqs.slice(0, 6)
}
