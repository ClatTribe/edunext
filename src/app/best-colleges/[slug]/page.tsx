import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { supabase } from "../../../../lib/supabase"
import CollegeEnquiryForm from "../../../../components/microsite/CollegeEnquiryForm"
import BestCollegesList, { type BestCollegeItem } from "../../../../components/microsite/BestCollegesList"
import BestCollegesFaq from "../../../../components/microsite/BestCollegesFaq"
import { resolveCategory, sortByRanking, rankLabelFor } from "../../../../lib/collegeRanking"
import {
  SITE, YEAR, type PageRow, type College,
  headingText, relatedLabel, metaTitle, metaDescription, introText, overviewSection, buildFaqs,
} from "../../../../lib/bestCollegesContent"
import { Star, ChevronRight, GraduationCap, Building2, Sparkles } from "lucide-react"

const borderColor = "rgba(245, 158, 11, 0.15)"

export const revalidate = 86400
export const dynamicParams = true

async function getPage(slug: string): Promise<PageRow | null> {
  const { data } = await supabase
    .from("seo_pages").select("*")
    .eq("slug", slug).eq("qualifies", true).eq("is_published", true)
    .maybeSingle()
  return (data as PageRow) ?? null
}

async function getColleges(slug: string): Promise<College[]> {
  const { data, error } = await supabase.rpc("get_colleges_for_page", { p_slug: slug })
  if (error) return []
  return (data as College[]) ?? []
}

async function getRelated(p: PageRow): Promise<PageRow[]> {
  const ors: string[] = []
  if (p.city_slug) ors.push(`city_slug.eq.${p.city_slug}`)
  if (p.course_slug) ors.push(`course_slug.eq.${p.course_slug}`)
  if (p.exam_slug) ors.push(`exam_slug.eq.${p.exam_slug}`)
  if (ors.length === 0) return []
  const { data } = await supabase
    .from("seo_pages").select("slug,exam,city,course,page_type,college_count")
    .eq("qualifies", true).eq("is_published", true).neq("slug", p.slug)
    .or(ors.join(",")).order("college_count", { ascending: false }).limit(12)
  return (data as PageRow[]) ?? []
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const p = await getPage(slug)
  if (!p) return { title: "Colleges | EduNext" }
  const title = metaTitle(p)
  const description = metaDescription(p)
  const canonical = `${SITE}/best-colleges/${slug}`
  return {
    title, description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    robots: { index: true, follow: true },
  }
}

export default async function BestCollegesPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const p = await getPage(slug)
  if (!p) notFound()

  const [colleges, related] = await Promise.all([getColleges(slug), getRelated(p)])

  const category = resolveCategory(p.course, p.exam)
  const ranked = sortByRanking(colleges, category)
  const listItems: BestCollegeItem[] = ranked.map((c) => ({
    slug: c.slug,
    college_name: c.college_name,
    location: c.location,
    rating: c.rating,
    review_count: c.review_count,
    rankLabel: rankLabelFor(c, category),
  }))

  const topNames = ranked.map((c) => c.college_name).filter(Boolean)
  const overview = overviewSection(p, topNames)
  const faqs = buildFaqs(p, ranked)

  const itemListLd = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: headingText(p), numberOfItems: ranked.length,
    itemListElement: ranked.slice(0, 25).map((c, i) => ({
      "@type": "ListItem", position: i + 1, url: `${SITE}/college/${c.slug}`, name: c.college_name,
    })),
  }
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Best Colleges", item: `${SITE}/best-colleges` },
      { "@type": "ListItem", position: 3, name: headingText(p), item: `${SITE}/best-colleges/${slug}` },
    ],
  }

  const formCollegeLabel = p.course
    ? `${p.course} Colleges${p.city ? ` in ${p.city}` : ""}`
    : p.city ? `Colleges in ${p.city}` : "Best Colleges"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-6 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <ChevronRight size={12} />
        <Link href="/find-colleges" className="hover:text-amber-400">Best Colleges</Link>
        <ChevronRight size={12} />
        <span className="text-slate-300 normal-case tracking-normal">{headingText(p)}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">{p.college_count} verified colleges</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[1.05]">
          Best{" "}
          {p.course && <span className="text-amber-500">{p.course} </span>}
          Colleges
          {p.city && <> in <span className="text-amber-500">{p.city}</span></>}
          {p.exam && <> accepting <span className="text-amber-500">{p.exam}</span></>}{" "}
          {YEAR}
        </h1>
        <p className="mt-5 max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">{introText(p)}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-[1.5px] w-6 bg-amber-500" />
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              Top {p.course ?? ""} colleges {p.city ? `in ${p.city}` : ""}
            </h2>
          </div>

          {ranked.length === 0 ? (
            <div className="rounded-2xl border bg-[#0F172B] p-8 text-slate-400 text-sm" style={{ borderColor }}>
              We&apos;re updating the list for this combination. Please use the enquiry form and our team will help you directly.
            </div>
          ) : (
            <BestCollegesList colleges={listItems} />
          )}

          <div className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-[1.5px] w-6 bg-amber-500" />
              <h2 className="text-base font-black text-white uppercase tracking-tight">{overview.heading}</h2>
            </div>
            <div className="space-y-4 rounded-2xl border bg-[#0F172B] p-6" style={{ borderColor }}>
              {overview.paras.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-400">{para}</p>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-[1.5px] w-6 bg-amber-500" />
              <h2 className="text-base font-black text-white uppercase tracking-tight">Frequently asked questions</h2>
            </div>
            <BestCollegesFaq faqs={faqs} />
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-[1.5px] w-6 bg-amber-500" />
                <h2 className="text-base font-black text-white uppercase tracking-tight">Related searches</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/best-colleges/${r.slug}`}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500/10 hover:border-amber-500/40">
                    {relatedLabel(r)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside className="w-full lg:w-[350px] shrink-0">
          <div className="lg:sticky lg:top-28">
            <CollegeEnquiryForm
              collegeName={formCollegeLabel}
              pageSource={`/best-colleges/${p.slug}`}
              title={<>Get <span className="text-amber-400">free admission</span> guidance</>}
            />
            <div className="mt-4 rounded-2xl border bg-[#0F172B] p-5" style={{ borderColor }}>
              <div className="flex items-center gap-2 text-amber-500">
                <Sparkles size={14} />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Why EduNext</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2"><GraduationCap size={13} className="text-amber-500 shrink-0" /> Verified colleges &amp; real reviews</li>
                <li className="flex items-center gap-2"><Star size={13} className="text-amber-500 shrink-0" /> Ranked by NIRF / EduNext</li>
                <li className="flex items-center gap-2"><Building2 size={13} className="text-amber-500 shrink-0" /> Zero spam calls</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
