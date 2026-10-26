import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { supabase } from "../../../../lib/supabase"
import { getPartner, getFormRow, isLive } from "../../../../lib/mbaForms"

const SITE = "https://www.getedunext.com"
export const revalidate = 3600

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getPartner(slug)
  if (!p) return { title: "MBA Application Forms | EduNext" }
  const row = await getFormRow(slug)
  const live = isLive(row)
  const title = `${p.school} MBA/PGDM Application Form 2027-29: Last Date, Fees & Apply Link`
  const description = live
    ? `${p.school} 2027-29 application form: last date ${fmt(row!.last_date) ?? "to be announced"}, exams accepted ${row!.exams ?? "as per school"}, fees and official apply link.`
    : `${p.school} 2027-29 MBA/PGDM admissions: application form status, last date, fees and cutoffs. Updated as soon as the school confirms its dates.`
  const url = `${SITE}/mba-forms/${slug}`
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    // Reserved pages stay out of the index until the school confirms its details (avoids thin pages).
    robots: live ? { index: true, follow: true } : { index: false, follow: true },
  }
}

export default async function MbaFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPartner(slug)
  if (!p) notFound()
  const row = await getFormRow(slug)
  const live = isLive(row)

  let card: { fees?: string; avg_package?: string; rating?: string } | null = null
  if (p.micrositeSlug) {
    const { data } = await supabase.from("college_microsites").select("card_detail").eq("slug", p.micrositeSlug).maybeSingle()
    const cd = data?.card_detail
    card = typeof cd === "string" ? JSON.parse(cd) : cd ?? null
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <nav className="text-xs text-slate-500 mb-4">
        <Link href="/" className="hover:text-amber-400">Home</Link> / <Link href="/forms-and-deadlines/mba" className="hover:text-amber-400">MBA Forms</Link> / {p.school}
      </nav>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
        {row?.programme ?? "MBA / PGDM 2027-29"} · {live ? "Admissions open" : "Page reserved"}
      </p>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold text-white">{p.school}</h1>
      <p className="text-slate-400">{p.city === p.region ? p.city : `${p.city}, ${p.region}`}</p>

      {live ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 p-4">
              <div className="text-xs uppercase text-slate-400">Last date</div>
              <div className="text-lg font-bold text-amber-400">{fmt(row!.last_date) ?? "To be announced"}</div>
            </div>
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs uppercase text-slate-400">Exams accepted</div>
              <div className="text-lg font-bold text-white">{row!.exams ?? "See school"}</div>
            </div>
            {(row!.fee_text || card?.fees) && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs uppercase text-slate-400">Fees</div>
                <div className="text-lg font-bold text-white">{row!.fee_text ?? card?.fees}</div>
              </div>
            )}
            {card?.avg_package && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                <div className="text-xs uppercase text-slate-400">Average package</div>
                <div className="text-lg font-bold text-white">{card.avg_package}</div>
              </div>
            )}
          </div>
          <Link href={`/mba-forms/${slug}/go`} prefetch={false} className="mt-6 block rounded-xl bg-amber-400 py-3 text-center font-bold text-black hover:bg-amber-300">
            Apply Now on the official portal →
          </Link>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
          <p className="text-white font-semibold">This admissions page is reserved for {p.school}.</p>
          <p className="mt-1 text-slate-400">The 2027-29 application link and last date will appear here as soon as the school confirms them.
            Meanwhile, see every MBA form that is open right now on{" "}
            <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">MBA Forms &amp; Deadlines</Link>.</p>
        </div>
      )}

      {p.micrositeSlug && (
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href={`/college/${p.micrositeSlug}`} className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400">Full profile</Link>
          <Link href={`/college/${p.micrositeSlug}/course-and-fees`} className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400">Courses &amp; fees</Link>
          <Link href={`/college/${p.micrositeSlug}/cutoff`} className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400">Cutoffs</Link>
          <Link href={`/college/${p.micrositeSlug}/placement`} className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400">Placements</Link>
        </div>
      )}

      <p className="mt-10 text-xs text-slate-500">EduNext links only to official application portals. Confirm dates on the school&apos;s website before applying.</p>
    </div>
  )
}
