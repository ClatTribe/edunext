// Server-rendered SEO block for B-school microsites (/college/<b-school>/*):
// a section-specific H1, a data-backed quick-facts table and FAQ, crawlable links
// to similar B-schools and MBA hubs, and JSON-LD (CollegeOrUniversity,
// BreadcrumbList, FAQPage). Renders nothing for non-management colleges.

import Link from "next/link"
import { isManagementCollege } from "../../lib/collegeSeo"
import { getCollege, getSimilarBSchools } from "../../lib/collegeData"
import { buildMbaFaqs, examList, getMbaFacts, CAT_2026_DATE, type MbaFacts, type MbaSection } from "../../lib/mbaFacts"
import { MBA_BLOGS, MBA_HUBS } from "../../lib/mbaLinks"
import CatScoreCta, { catCalculatorUrl } from "../CatScoreCta"

const SITE = "https://www.getedunext.com"

const SECTION_LABEL: Record<MbaSection, string> = {
  overview: "",
  cutoff: "Cutoff",
  "course-and-fees": "Fees",
  placement: "Placements",
  admission: "Admission",
  ranking: "Ranking",
  reviews: "Reviews",
  contact: "Contact",
}

export function mbaHeading(f: MbaFacts, section: MbaSection): string {
  const e = f.exams[0] || "CAT"
  switch (section) {
    case "cutoff": return `${f.name} ${e} Cutoff 2026`
    case "course-and-fees": return `${f.name} ${f.course} Fees 2027-29`
    case "placement": return `${f.name} ${f.course} Placements 2026`
    case "admission": return `${f.name} ${f.course} Admission 2027`
    case "ranking": return `${f.name} ${f.course} Ranking 2026`
    case "reviews": return `${f.name} ${f.course} Reviews`
    case "contact": return `${f.name} Contact Details`
    default: return `${f.name}: ${f.course} Fees, Cutoff, Placements and Admission 2027`
  }
}

function intro(f: MbaFacts, section: MbaSection): string {
  const where = [f.city, f.state].filter(Boolean).join(", ")
  const exams = f.exams.length ? examList(f.exams) : ""
  const s: string[] = []
  switch (section) {
    case "cutoff":
      s.push(`${f.name} shortlists ${f.course} applicants${exams ? ` on ${exams} scores` : ""}.`)
      if (f.iimCutoff?.overall) s.push(`The General-category minimum is ${f.iimCutoff.overall} percentile overall (${f.iimCutoff.cycle} policy).`)
      s.push(`CAT 2026 is on ${CAT_2026_DATE}; the tables below show the latest published cutoffs.`)
      break
    case "course-and-fees":
      s.push(f.fee ? `The total fee for ${f.fee.course} at ${f.name} is ${f.fee.value}.` : `Course-wise fees for ${f.name} are listed below.`)
      break
    case "placement":
      if (f.average || f.highest) s.push(`${f.name} reported${f.average ? ` an average package of ${f.average}` : ""}${f.average && f.highest ? " and" : ""}${f.highest ? ` a highest package of ${f.highest}` : ""}${f.placementLabel ? ` for ${f.placementLabel}` : ""}.`)
      if (f.recruiters.length >= 3) s.push(`Recruiters include ${f.recruiters.slice(0, 4).join(", ")}.`)
      break
    case "admission":
      s.push(`${f.name} admits ${f.course} students for 2027-29${exams ? ` through ${exams}` : ""}.`)
      break
    default:
      s.push(`${f.name}${where ? ` (${where})` : ""} offers ${f.course}${exams ? ` admission through ${exams}` : ""}.`)
      if (f.fee) s.push(`Total fee: ${f.fee.value}.`)
      if (f.average) s.push(`Average package: ${f.average}.`)
  }
  return s.join(" ")
}

function factsRows(f: MbaFacts): [string, string][] {
  const rows: [string, string][] = []
  if (f.exams.length) rows.push(["Exams accepted", f.exams.join(", ")])
  if (f.fee) rows.push([`Total fee (${f.fee.course})`, f.fee.value])
  if (f.average) rows.push([`Average package${f.placementLabel ? ` (${f.placementLabel})` : ""}`, f.average])
  if (f.median) rows.push(["Median package", f.median])
  if (f.highest) rows.push(["Highest package", f.highest])
  if (f.iimCutoff?.overall) rows.push([`Minimum CAT percentile, General (${f.iimCutoff.cycle})`, String(f.iimCutoff.overall)])
  const where = [f.city, f.state].filter(Boolean).join(", ")
  if (where) rows.push(["Location", where])
  return rows
}

/** H1 for B-school pages; the hero shows the name without a heading tag on these pages. */
export async function MbaHeading({ slug, section }: { slug: string; section: MbaSection }) {
  const college = await getCollege(slug)
  if (!college || !isManagementCollege(slug, college.college_name)) return null
  const f = getMbaFacts(college)
  return (
    <header className="mb-6 space-y-2">
      <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{mbaHeading(f, section)}</h1>
      <p className="text-sm md:text-base text-slate-400 leading-relaxed">{intro(f, section)}</p>
      <CatScoreCta variant="inline" placement={`bschool-${section}-top`} />
    </header>
  )
}

export default async function MbaSeoBlock({ slug, section }: { slug: string; section: MbaSection }) {
  const college = await getCollege(slug)
  if (!college || !isManagementCollege(slug, college.college_name)) return null

  const f = getMbaFacts(college)
  const faqs = buildMbaFaqs(f, section)
  const rows = factsRows(f)
  const similar = await getSimilarBSchools(slug, college.location || "")
  const path = section === "overview" ? "" : `/${section}`
  const url = `${SITE}/college/${slug}${path}`
  const subLink = section === "cutoff" || section === "overview" ? "placement" : "cutoff"

  const org: Record<string, any> = {
    "@type": "CollegeOrUniversity",
    "@id": `${SITE}/college/${slug}#org`,
    name: f.name,
    url: `${SITE}/college/${slug}`,
  }
  if (f.city || f.state) org.address = { "@type": "PostalAddress", addressLocality: f.city || undefined, addressRegion: f.state || undefined, addressCountry: "IN" }
  if (f.website) org.sameAs = [f.website]

  const crumbs = [
    { name: "Home", item: SITE },
    { name: "MBA colleges", item: `${SITE}/mba-colleges-by-cat-percentile` },
    { name: f.name, item: `${SITE}/college/${slug}` },
  ]
  if (section !== "overview") crumbs.push({ name: SECTION_LABEL[section], item: url })

  const graph: any[] = [
    org,
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
    },
  ]
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
    })
  }

  return (
    <section aria-label={`${f.name} MBA quick facts`} className="mt-12 space-y-8 text-slate-300">
      <CatScoreCta placement={`bschool-${section}`} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />

      {rows.length >= 2 && (
        <div className="rounded-2xl border border-amber-500/15 bg-[#0F172B] p-6">
          <h2 className="text-xl font-bold text-white mb-4">{f.name} {f.course} at a glance</h2>
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-white/5 last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-semibold text-slate-400 align-top w-1/2">{k}</th>
                  <td className="py-2 text-white">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="rounded-2xl border border-amber-500/15 bg-[#0F172B] p-6">
          <h2 className="text-xl font-bold text-white mb-4">{f.name} {SECTION_LABEL[section] || f.course}: FAQs</h2>
          <div className="space-y-4">
            {faqs.map((x) => (
              <div key={x.q}>
                <h3 className="font-semibold text-amber-400">{x.q}</h3>
                <p className="text-sm leading-relaxed mt-1">{x.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <nav aria-label="Similar B-schools" className="rounded-2xl border border-white/5 bg-[#0F172B] p-6">
          <h2 className="text-xl font-bold text-white mb-4">Other MBA colleges in {f.state || f.city}</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {similar.map((s) => (
              <li key={s.slug}>
                <Link href={`/college/${s.slug}`} className="text-amber-400 hover:underline">{s.name}</Link>
                <span className="text-slate-500"> · </span>
                <Link href={`/college/${s.slug}/${subLink}`} className="text-slate-400 hover:text-amber-400">{subLink === "cutoff" ? "cutoff" : "placements"}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav aria-label="MBA 2027 tools and guides" className="rounded-2xl border border-white/5 bg-[#0F172B] p-6">
        <h2 className="text-xl font-bold text-white mb-4">CAT 2026 and MBA 2027 tools</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <li><a href={catCalculatorUrl(`bschool-${section}-tools`)} target="_blank" rel="nofollow noopener" className="text-amber-400 hover:underline">CAT 2026 score calculator (response sheet)</a></li>
          {MBA_HUBS.map((l) => (
            <li key={l.href}><Link href={l.href} className="text-amber-400 hover:underline">{l.label}</Link></li>
          ))}
          {MBA_BLOGS.slice(0, 4).map((l) => (
            <li key={l.href}><Link href={l.href} className="text-slate-300 hover:text-amber-400">{l.label}</Link></li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
