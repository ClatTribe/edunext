import Link from "next/link"
import type { Metadata } from "next"

const URL = "https://www.getedunext.com/cat-admit-card"
export const revalidate = 86400

// One evergreen URL: update these values each CAT cycle.
const CAT = {
  year: 2026,
  admitCardDate: "4 November 2026",
  examDate: "29 November 2026 (Sunday)",
  downloadTill: "29 November 2026",
  convener: "IIM Indore",
  cities: "about 170",
  resultExpected: "first week of January 2027",
  updated: "26 October 2026",
}

// Slot timings follow the pattern of recent CAT exams. The exact time for each candidate is printed on the admit card.
const SLOTS = [
  { slot: "Slot 1 (Morning)", exam: "8:30 AM to 10:30 AM", reporting: "7:00 AM", gate: "8:15 AM" },
  { slot: "Slot 2 (Afternoon)", exam: "12:30 PM to 2:30 PM", reporting: "11:00 AM", gate: "12:15 PM" },
  { slot: "Slot 3 (Evening)", exam: "4:30 PM to 6:30 PM", reporting: "3:00 PM", gate: "4:15 PM" },
]

const title = `CAT ${CAT.year} Admit Card: Release Date (${CAT.admitCardDate}), Download Steps & Exam Day Rules`
const description = `CAT ${CAT.year} admit card releases on ${CAT.admitCardDate} at iimcat.ac.in. See how to download it, what to check, slot timings, reporting time, documents to carry and items not allowed for the ${CAT.examDate.split(" (")[0]} exam.`

export const metadata: Metadata = {
  title,
  description,
  keywords: `CAT ${CAT.year} admit card, CAT admit card download, CAT ${CAT.year} admit card release date, iimcat.ac.in admit card, CAT ${CAT.year} exam day guidelines, CAT slot timings`,
  alternates: { canonical: URL },
  openGraph: { title, description, url: URL, type: "article" },
}

const STEPS = [
  "Go to the official CAT website, iimcat.ac.in.",
  "Click the registered candidate login.",
  "Enter the User ID and password you created during CAT registration.",
  "Open the admit card link in your dashboard.",
  "Download the admit card as a PDF and save a copy on your phone and laptop.",
  "Print it on A4 paper. Keep at least two printouts.",
]

const CHECK = [
  "Your name, spelt exactly as on your photo ID",
  "Photograph and signature",
  "CAT registration number / User ID",
  "Exam date and your slot",
  "Reporting time and gate closing time",
  "Test centre name and full address",
  "Category and PwD status (if applicable)",
]

const CARRY = [
  "Printout of the CAT admit card (A4)",
  "Original valid photo ID, such as Aadhaar, PAN card or passport. The name must match the admit card",
  "A recent passport-size photograph, if your admit card asks you to affix one",
  "Scribe affidavit and PwD certificate, only if you were approved for a scribe",
]

const NOT_ALLOWED = [
  "Mobile phones, smartwatches, Bluetooth devices and any electronic gadget",
  "Any kind of watch",
  "Calculators (an on-screen calculator is provided)",
  "Your own pens, pencils, paper or stationery",
  "Wallets, bags, goggles and metallic jewellery",
  "Thick-soled footwear and clothes with large buttons",
]

export default function CatAdmitCardPage() {
  const faqs = [
    {
      q: `When will the CAT ${CAT.year} admit card be released?`,
      a: `The CAT ${CAT.year} admit card releases on ${CAT.admitCardDate} on iimcat.ac.in and stays available to download until the exam day, ${CAT.downloadTill}.`,
    },
    {
      q: `How do I download the CAT ${CAT.year} admit card?`,
      a: "Log in at iimcat.ac.in with the User ID and password from your CAT registration, open the admit card link in your dashboard, then download and print it on A4 paper.",
    },
    {
      q: "What if there is a mistake on my CAT admit card?",
      a: "Contact the CAT helpdesk through the contact details on iimcat.ac.in as soon as you notice the error, and do it well before the exam day. Do not change anything on the admit card yourself.",
    },
    {
      q: "What documents do I need on the CAT exam day?",
      a: "Carry a printed copy of your CAT admit card and an original valid photo ID such as Aadhaar, PAN card or passport. The name on the ID must match the admit card.",
    },
    {
      q: "Is a calculator allowed in CAT?",
      a: "No. Personal calculators are not allowed. CAT provides an on-screen calculator, and a pen and scribble pad are given at the test centre.",
    },
    {
      q: `When is the CAT ${CAT.year} result?`,
      a: `The CAT ${CAT.year} result is expected in the ${CAT.resultExpected}. It will be published on iimcat.ac.in.`,
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
        <Link href="/" className="hover:text-amber-400">Home</Link> / <Link href="/forms-and-deadlines/mba" className="hover:text-amber-400">MBA</Link> / CAT admit card
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-white">
        CAT {CAT.year} admit card: <span className="text-amber-400">release date</span>, download and exam day rules
      </h1>
      <p className="mt-4 text-slate-400 max-w-3xl">
        The CAT {CAT.year} admit card releases on {CAT.admitCardDate} on the official website, iimcat.ac.in. CAT {CAT.year} is on {CAT.examDate},
        conducted by {CAT.convener} as a computer-based test in three slots across {CAT.cities} cities. Here is how to download your admit card,
        what to check on it, and what to carry on exam day.
      </p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Admit card release</div>
          <div className="mt-1 text-white font-semibold">{CAT.admitCardDate}</div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">CAT {CAT.year} exam</div>
          <div className="mt-1 text-white font-semibold">{CAT.examDate}</div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Result (expected)</div>
          <div className="mt-1 text-white font-semibold">{CAT.resultExpected.replace("first week of ", "First week, ")}</div>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">How to download the CAT {CAT.year} admit card</h2>
      <ol className="mt-4 space-y-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex gap-3 rounded-lg border border-slate-800 p-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-slate-300">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-slate-500">Forgot your password? Use the &quot;Forgot password&quot; option on the iimcat.ac.in login page.</p>

      <h2 className="mt-10 text-2xl font-bold text-white">What to check on your admit card</h2>
      <ul className="mt-4 grid sm:grid-cols-2 gap-2">
        {CHECK.map((c) => (
          <li key={c} className="rounded-lg border border-slate-800 p-3 text-slate-300">{c}</li>
        ))}
      </ul>
      <p className="mt-3 text-slate-400">
        If anything is wrong, contact the CAT helpdesk using the details on iimcat.ac.in right away. Do not edit the admit card yourself.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-white">CAT {CAT.year} slot timings and reporting time</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left p-3">Slot</th>
              <th className="text-left p-3">Exam time</th>
              <th className="text-left p-3">Reporting time</th>
              <th className="text-left p-3">Gate closes</th>
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((s) => (
              <tr key={s.slot} className="border-t border-slate-800">
                <td className="p-3 text-white">{s.slot}</td>
                <td className="p-3 text-amber-400">{s.exam}</td>
                <td className="p-3">{s.reporting}</td>
                <td className="p-3">{s.gate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Expected timings based on recent CAT exams. Your exact slot, reporting time and gate closing time are printed on your admit card. Follow those.
      </p>
      <p className="mt-3 text-slate-400">
        The exam is 120 minutes long: 40 minutes each for VARC, DILR and QA, in that order. You cannot move between sections while a section&apos;s timer is running.
      </p>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 p-5">
          <h2 className="text-xl font-bold text-emerald-300">What to carry</h2>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-slate-300">
            {CARRY.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <p className="mt-3 text-xs text-slate-500">A pen and scribble pad are given at the centre and collected after the test.</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 p-5">
          <h2 className="text-xl font-bold text-red-300">Not allowed inside</h2>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-slate-300">
            {NOT_ALLOWED.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-white">Exam day tips</h2>
      <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-300">
        <li>Visit your test centre a day before if you can, so you know the route and travel time.</li>
        <li>Reach before the reporting time. Entry closes at the gate closing time on your admit card, with no exceptions.</li>
        <li>Use only the mouse during the test. The on-screen calculator is available for calculations.</li>
        <li>Read the instructions and the non-disclosure agreement before the test starts.</li>
      </ul>

      <div className="mt-10 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
        <h2 className="text-xl font-bold text-white">After the exam</h2>
        <p className="mt-2 text-slate-400">
          Estimate your score with the <Link href="/cat-percentile-predictor" className="text-amber-400 underline">CAT Percentile Predictor</Link>,
          compare the minimum percentile at every IIM on the <Link href="/iim-cutoff" className="text-amber-400 underline">IIM cutoff</Link> page,
          and see which B-schools fit your score with the <Link href="/cat-college-predictor" className="text-amber-400 underline">CAT College Predictor</Link>.
          Many private B-schools close their first round before results, so track last dates on <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">MBA Forms &amp; Deadlines</Link>.
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
        Dates from the CAT {CAT.year} schedule announced on iimcat.ac.in. Slot timings are expected and will be confirmed on the admit card.
        Updated {CAT.updated}. Always follow the instructions on your admit card and on iimcat.ac.in.
      </p>
    </div>
  )
}
