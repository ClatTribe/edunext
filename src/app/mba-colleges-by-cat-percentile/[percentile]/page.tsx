import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CAT_CUTOFFS } from "../../../../lib/catCutoffs"

const SITE = "https://www.getedunext.com"
const PERCENTILES = [50, 60, 65, 70, 75, 80, 85, 90, 95] as const
export const revalidate = 86400
export const dynamicParams = false

export function generateStaticParams() {
  return PERCENTILES.map((p) => ({ percentile: String(p) }))
}

function parse(raw: string): number | null {
  const n = Number(raw)
  return (PERCENTILES as readonly number[]).includes(n) ? n : null
}

function lists(p: number) {
  const sorted = [...CAT_CUTOFFS].sort((a, b) => b.cutoff - a.cutoff)
  const safe = sorted.filter((c) => c.cutoff <= p)
  const stretch = sorted.filter((c) => c.cutoff > p && c.cutoff <= p + 3)
  return { safe, stretch }
}

export async function generateMetadata({ params }: { params: Promise<{ percentile: string }> }): Promise<Metadata> {
  const { percentile } = await params
  const p = parse(percentile)
  if (!p) return { title: "MBA colleges by CAT percentile | EduNext" }
  const { safe } = lists(p)
  const title = `MBA Colleges Accepting ${p} Percentile in CAT 2026: ${safe.length}+ Options & Cutoffs`
  const description = `Got ${p} percentile in CAT? See ${safe.length}+ MBA and PGDM colleges whose previous cutoffs fall at or below ${p} percentile, plus stretch options, application last dates and next steps for 2027-29 admissions.`
  const url = `${SITE}/mba-colleges-by-cat-percentile/${p}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website" } }
}

export default async function PercentilePage({ params }: { params: Promise<{ percentile: string }> }) {
  const { percentile } = await params
  const p = parse(percentile)
  if (!p) notFound()
  const { safe, stretch } = lists(p)
  const top = safe.slice(0, 40)

  const faqs = [
    {
      q: `Which MBA colleges accept ${p} percentile in CAT?`,
      a: `Based on previous-cycle cutoffs, ${safe.length} colleges in EduNext's dataset have a cutoff at or below ${p} percentile, including ${top.slice(0, 4).map((c) => c.name).join(", ")}. Cutoffs change every year, so treat these as indicative.`,
    },
    {
      q: `Is ${p} percentile in CAT good for MBA?`,
      a: p >= 90
        ? `Yes. ${p} percentile puts you in contention for many top private B-schools and some newer IIMs, depending on your profile and sectional scores.`
        : p >= 75
          ? `${p} percentile opens up a wide range of established private B-schools in Delhi NCR, Mumbai, Pune and Bangalore. Apply early, since many close first rounds before results.`
          : `${p} percentile is enough for many private PGDM and MBA programmes. Focus on schools with strong placements for your budget, and consider XAT, CMAT and MAT scores as additional options.`,
    },
    {
      q: "When should I apply to MBA colleges?",
      a: "Many private B-schools open applications in September to November and close their first rounds before CAT results. Track last dates on EduNext's MBA Forms & Deadlines page.",
    },
  ]
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <nav className="text-xs text-slate-500 mb-4">
        <Link href="/" className="hover:text-amber-400">Home</Link> / <Link href="/forms-and-deadlines/mba" className="hover:text-amber-400">MBA Forms</Link> / {p} percentile
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-white">MBA colleges accepting <span className="text-amber-400">{p} percentile</span> in CAT</h1>
      <p className="mt-4 text-slate-400 max-w-3xl">
        With {p} percentile in CAT 2026, these are the B-schools whose previous admission-cycle cutoffs fall at or below your score.
        We list {safe.length} realistic options and {stretch.length} stretch options just above {p} percentile. Cutoffs shift every year
        and many schools also weigh sectional scores, academics and work experience, so use this as a shortlist, not a guarantee.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PERCENTILES.map((q) => (
          <Link key={q} href={`/mba-colleges-by-cat-percentile/${q}`}
            className={`px-3 py-1.5 rounded-full text-sm border ${q === p ? "bg-amber-400 text-black border-amber-400" : "border-slate-700 hover:border-amber-400"}`}>
            {q} percentile
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">Realistic options at {p} percentile</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400"><tr><th className="text-left p-3">#</th><th className="text-left p-3">College</th><th className="text-right p-3">Indicative cutoff</th></tr></thead>
          <tbody>
            {top.map((c, i) => (
              <tr key={c.name} className="border-t border-slate-800">
                <td className="p-3 text-slate-500">{i + 1}</td>
                <td className="p-3 text-white">{c.name}</td>
                <td className="p-3 text-right text-amber-400">{c.cutoff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {safe.length > top.length && <p className="mt-2 text-xs text-slate-500">Showing the 40 highest-cutoff options at or below {p} percentile, out of {safe.length}.</p>}

      {stretch.length > 0 && (
        <>
          <h2 className="mt-10 text-2xl font-bold text-white">Stretch options (cutoff {p} to {p + 3})</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
            {stretch.map((c) => (
              <li key={c.name} className="rounded-lg border border-slate-800 p-3"><span className="text-white">{c.name}</span> <span className="text-amber-400 float-right">{c.cutoff}</span></li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
        <h2 className="text-xl font-bold text-white">Do not wait for your result to apply</h2>
        <p className="mt-2 text-slate-400">Many B-schools close their first round before CAT results. See every open form and its last date on the{" "}
          <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">MBA Forms &amp; Deadlines</Link> page, or get a personalised list from the{" "}
          <Link href="/cat-college-predictor" className="text-amber-400 underline">CAT College Predictor</Link>.</p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">Frequently asked questions</h2>
      {faqs.map((f) => (
        <div key={f.q} className="mt-4">
          <h3 className="font-semibold text-white">{f.q}</h3>
          <p className="text-slate-400">{f.a}</p>
        </div>
      ))}
      <p className="mt-8 text-xs text-slate-500">Indicative general-category cutoffs from the previous admission cycle, compiled by EduNext. Data current as of October 2026. Verify on each school&apos;s official website before deciding.</p>
    </div>
  )
}
