import Link from "next/link"
import type { Metadata } from "next"
import IimCutoffTable from "./IimCutoffTable"
import { IIM_CUTOFFS, IIM_CUTOFF_UPDATED } from "../../../lib/iimCutoffs"
import CatScoreCta from "../../../components/CatScoreCta"

const URL = "https://www.getedunext.com/iim-cutoff"
export const revalidate = 86400

const title = "IIM Cutoff 2026: CAT Percentile for All 22 IIMs (Category & Sectional)"
const description =
  "Compare the minimum CAT percentile for all 22 IIMs: overall and sectional (VARC, DILR, QA) cutoffs for General, EWS, NC-OBC, SC, ST and PwD, from each IIM's official admission policy."

export const metadata: Metadata = {
  title,
  description,
  keywords: "IIM cutoff 2026, CAT cutoff for IIMs, IIM cutoff percentile, IIM sectional cutoff, CAT 2026 cutoff, IIM cutoff category wise",
  alternates: { canonical: URL },
  openGraph: { title, description, url: URL, type: "website" },
}

// Indicative interview-call percentiles (General) for the older IIMs, as shown on their cutoff pages.
const CALL_RANGES = [
  { slug: "iim-ahmedabad", name: "IIM Ahmedabad", range: "99+" },
  { slug: "iim-bangalore", name: "IIM Bangalore", range: "99+" },
  { slug: "iim-calcutta", name: "IIM Calcutta", range: "99+" },
  { slug: "iim-lucknow", name: "IIM Lucknow", range: "97 to 99+" },
  { slug: "iim-kozhikode", name: "IIM Kozhikode", range: "97 to 99.5+" },
  { slug: "iim-indore", name: "IIM Indore", range: "97 to 99" },
]

export default function IimCutoffPage() {
  const general = IIM_CUTOFFS.filter((i) => i.cutoffs.General?.overall != null)
  const highest = [...general].sort((a, b) => b.cutoffs.General!.overall! - a.cutoffs.General!.overall!)[0]
  const lowest = [...general].sort((a, b) => a.cutoffs.General!.overall! - b.cutoffs.General!.overall!)[0]
  const byProcess = (p: "Own" | "CAP" | "JAP") => IIM_CUTOFFS.filter((i) => i.process === p).map((i) => i.name.replace("IIM ", ""))

  const faqs = [
    {
      q: "What is the minimum CAT percentile for IIMs?",
      a: `For General category candidates, the minimum overall CAT percentile ranges from ${lowest.cutoffs.General!.overall} (${lowest.name}) to ${highest.cutoffs.General!.overall} (${highest.name}). These are eligibility minimums. Actual interview calls at the older IIMs usually need 97 to 99+ percentile.`,
    },
    {
      q: "Which IIM has the lowest CAT cutoff?",
      a: `${lowest.name} has the lowest published minimum for General category, at ${lowest.cutoffs.General!.overall} percentile overall with ${lowest.cutoffs.General!.varc} in each section. Several newer IIMs that admit through CAP or JAP also have minimums around 90 percentile.`,
    },
    {
      q: "What is the sectional cutoff for IIMs?",
      a: "Most IIMs set a minimum percentile in each CAT section (VARC, DILR and QA) in addition to the overall percentile. For General category it ranges from 65 (CAP IIMs) to 85 (IIM Ahmedabad and IIM Lucknow). IIM Rohtak and IIM Sambalpur set no sectional percentile minimum.",
    },
    {
      q: "What are CAP and JAP in IIM admissions?",
      a: `CAP (Common Admission Process) is a joint process run by ${byProcess("CAP").join(", ")}. JAP (Joint Admission Process) is run by IIM ${byProcess("JAP").join(", ")}. Candidates register once and are shortlisted using common cutoffs. The other IIMs run their own admission processes.`,
    },
    {
      q: "Is 90 percentile enough for an IIM?",
      a: "90 percentile meets the General category minimum at many newer IIMs, such as the CAP and JAP IIMs, IIM Sambalpur and IIM Amritsar. Whether you get an interview call depends on your sectional scores, academics, work experience and the final cutoff, which is usually higher than the minimum.",
    },
  ]
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <nav className="text-xs text-slate-500 mb-4">
        <Link href="/" className="hover:text-amber-400">Home</Link> / <Link href="/forms-and-deadlines/mba" className="hover:text-amber-400">MBA</Link> / IIM cutoff
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-white">
        IIM cutoff 2026: <span className="text-amber-400">CAT percentile</span> for all 22 IIMs
      </h1>
      <p className="mt-4 text-slate-400 max-w-3xl">
        The minimum CAT percentile each IIM needs before it will consider your application, overall and in each section, for every category.
        Numbers come from each IIM&apos;s own admission policy for the CAT 2025 cycle, or CAT 2026 where the IIM has already published it.
        Choose your category to compare all 22 IIMs.
      </p>

      <CatScoreCta placement="iim-cutoff" className="mt-6" />

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Highest minimum (General)</div>
          <div className="mt-1 text-white font-semibold">{highest.name} <span className="text-amber-400">{highest.cutoffs.General!.overall}</span></div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Lowest minimum (General)</div>
          <div className="mt-1 text-white font-semibold">{lowest.name} <span className="text-amber-400">{lowest.cutoffs.General!.overall}</span></div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">CAT 2026 exam date</div>
          <div className="mt-1 text-white font-semibold">29 November 2026</div>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">IIM cutoff table: minimum CAT percentile</h2>
      <div className="mt-4">
        <IimCutoffTable />
      </div>

      <div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
        <h2 className="text-xl font-bold text-white">Minimum cutoff vs the percentile you actually need</h2>
        <p className="mt-2 text-slate-400">
          The table shows eligibility minimums. Meeting them only means the IIM will consider you. Final interview calls go to candidates well above
          these numbers, especially at the older IIMs. Indicative General category percentiles for an interview call:
        </p>
        <ul className="mt-3 grid sm:grid-cols-2 gap-2">
          {CALL_RANGES.map((c) => (
            <li key={c.slug} className="rounded-lg border border-slate-800 p-3">
              <Link href={`/college/${c.slug}/cutoff`} className="text-white hover:text-amber-400">{c.name}</Link>
              <span className="text-amber-400 float-right">{c.range}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Approximate, based on past admission trends reported by CAT coaching sources. Not official cutoffs.</p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">How IIM admissions are grouped</h2>
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="font-semibold text-white">Own process</div>
          <p className="mt-1 text-sm text-slate-400">Each IIM sets its own cutoffs and interview round: {byProcess("Own").join(", ")}.</p>
        </div>
        <div className="rounded-xl border border-sky-500/30 p-4">
          <div className="font-semibold text-sky-300">CAP</div>
          <p className="mt-1 text-sm text-slate-400">Common Admission Process with shared cutoffs: {byProcess("CAP").join(", ")}. Female and transgender candidates get a 5 percentile lower overall minimum.</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 p-4">
          <div className="font-semibold text-emerald-300">JAP</div>
          <p className="mt-1 text-sm text-slate-400">Joint Admission Process: {byProcess("JAP").join(", ")}. 90 percentile to register; 95.25 (General) was the interview shortlist cutoff for CAT 2025.</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-800 p-5">
        <h2 className="text-xl font-bold text-white">Check where your score fits</h2>
        <p className="mt-2 text-slate-400">
          Estimate your percentile with the <Link href="/cat-percentile-predictor" className="text-amber-400 underline">CAT Percentile Predictor</Link>,
          get a college list from the <Link href="/cat-college-predictor" className="text-amber-400 underline">CAT College Predictor</Link>, or browse{" "}
          <Link href="/mba-colleges-by-cat-percentile/90" className="text-amber-400 underline">MBA colleges at 90 percentile</Link>. Many private B-schools close
          first-round applications before CAT results, so track last dates on <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">MBA Forms &amp; Deadlines</Link>.
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">Frequently asked questions</h2>
      {faqs.map((f) => (
        <div key={f.q} className="mt-4">
          <h3 className="font-semibold text-white">{f.q}</h3>
          <p className="text-slate-400">{f.a}</p>
        </div>
      ))}

      <p className="mt-8 text-xs text-slate-500">
        Source: each IIM&apos;s official admission policy, the CAP 2026 and JAP 2026 cutoff documents. IIM Rohtak and IIM Sambalpur figures are as reported by
        CAT news sites because their official documents were not accessible. Updated {IIM_CUTOFF_UPDATED}. IIMs revise cutoffs every year, so confirm on the
        official website before applying.
      </p>
    </div>
  )
}
