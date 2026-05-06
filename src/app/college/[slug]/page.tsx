"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "../../../../lib/supabase"
import { useParams, usePathname } from "next/navigation"
import CollegeMatchCard from "../../../../components/CollegeMatchCard"
import CollegeEnquiryForm from "../../../../components/microsite/CollegeEnquiryForm"
import {
  Loader2, Eye, Target, Phone, Globe, GraduationCap,
  MapPin, ArrowUpRight, BarChart3, Wallet, Award,
  Building2, Headset, ChevronRight, Sparkles
} from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, title, accent }: { label: string; title: string; accent: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-[1.5px] w-8 bg-amber-500" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">{label}</span>
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
        {title} <span className="text-amber-500">{accent}</span>
      </h2>
    </div>
  )
}

// ─── View Full Link ───────────────────────────────────────────────────────────

function ViewFullLink({ href, label = "View Full Details" }: { href: string; label?: string }) {
  return (
    <div className="flex justify-end">
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-300 transition-all duration-300 text-[10px] font-black uppercase tracking-widest group"
      >
        {label}
        <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}

// ─── Preview Table ───────────────────────────────────────────────────────────

function PreviewTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const allRows: any[][] = (table.rows || []).map((row: any) =>
    Array.isArray(row) ? row : (row?.base_data || [])
  ).filter((r: any[]) => Array.isArray(r) && r.length > 0)

  const previewRows = allRows.slice(0, 3)

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050818]/40">
      <table className="w-full text-sm border-collapse min-w-[400px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {headers.map((h, hi) => (
              <th key={hi}
                className={`px-5 py-4 text-left font-black uppercase tracking-widest whitespace-nowrap text-xs
                  ${hi === 0 ? 'text-slate-200 sticky left-0 z-10 bg-[#070d1e]' : 'text-amber-500/90 bg-[#070d1e]'}`}>
                {h || '—'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/[0.04] hover:bg-amber-500/[0.03] transition-colors group/tr">
              {row.map((cell: any, ci: number) => (
                <td key={ci}
                  className={`px-5 py-4 text-sm font-medium transition-colors
                    ${ci === 0
                      ? 'text-slate-300 sticky left-0 bg-[#050818]/80 group-hover/tr:text-white'
                      : 'text-slate-400 group-hover/tr:text-amber-400'}`}>
                  {cleanCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {allRows.length > 3 && (
        <div className="px-5 py-3 border-t border-white/5 bg-gradient-to-r from-[#050818]/80 to-transparent">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            +{allRows.length - 3} more rows in full view
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Apply Card ───────────────────────────────────────────────────────────────

function ApplyCard({ collegeName, url }: { collegeName: string; url?: string }) {
  return (
    <div className="group relative flex flex-col justify-between h-full rounded-[2rem] border border-white/5 bg-[#050818] overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-500/30 p-8">
      {/* Glow blob */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/[0.03] blur-[60px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-[1.5px] w-6 bg-amber-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Official Portal</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight">
            Apply at <span className="text-amber-500">{collegeName || "This College"}.</span>
          </h3>
        </div>

        {/* Body */}
        {/* <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-xs">
          Connect with the official admissions desk for personalized counseling, direct application support, and real-time seat availability.
        </p> */}

        {/* Highlights */}
        {/* <ul className="space-y-2">
          {["Direct admission process", "Official fee structure", "Scholarship eligibility"].map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul> */}
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-8">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-amber-500 text-[#050818] rounded-2xl shadow-[0_0_24px_rgba(245,158,11,0.3)] hover:shadow-[0_0_36px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest group/btn"
          >
            <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" />
            Apply Directly
            <ArrowUpRight size={14} />
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl border border-amber-500/20 text-amber-500/40 font-black text-xs uppercase tracking-widest cursor-not-allowed">
            Website Not Available
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollegeOverviewPage() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params?.slug as string

  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  useEffect(() => { fetchCollege() }, [slug])

  // ─── Check if user has filled their profile ───
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from("admit_profiles")
          .select("name, degree, city")
          .eq("user_id", user.id)
          .single()
        if (profile?.name && profile?.degree) {
          setIsProfileComplete(true)
        }
      } catch {
        // Not logged in or no profile — stays false
      }
    }
    checkProfile()
  }, [])

  useEffect(() => {
    const urlParts = pathname.split('/')
    const section = urlParts[urlParts.length - 1]
    if (section && section !== slug) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [pathname, slug])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
      if (data) setCollege(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
    </div>
  )
  if (!college) return null

const rawMicrosite = typeof college.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college.microsite_data || {})

  const micrositeData = Array.isArray(rawMicrosite)
    ? college
    : { ...college, ...rawMicrosite }

  const base = `/college/${slug}`

  // ─── DATA EXTRACTION ───
  const aboutText: string = college.about || micrositeData?.about || ""
  const vision: string    = micrositeData?.about_section?.vision || ""
  const mission: string   = micrositeData?.about_section?.mission || ""

  const rawFees: any[] = micrositeData?.fees || college?.fees || []
  const firstFeeTable = rawFees[0] || null

  const placementData: any[] = micrositeData?.placement || college?.placement || []
  const allRows = placementData.flatMap(t => t.rows || [])
  const collegeNameLower = college.college_name?.toLowerCase() || ""

  const hpMatch = allRows.find(r =>
    (r[0]?.toString().toLowerCase().includes("highest package") ||
     r[0]?.toString().toLowerCase().includes(collegeNameLower)) &&
    !r[1]?.toString().toLowerCase().includes("salary") &&
    r[1] !== '—' && r[1] !== '-'
  )
  const finalHighest = hpMatch?.[1] || null

  const apMatch = allRows.find(r =>
    (r[0]?.toString().toLowerCase().includes("average package") ||
     r[0]?.toString().toLowerCase().includes("median package")) &&
    r[1] !== '—' && r[1] !== '-'
  )
  const finalAverage = apMatch?.[1] || null

  const recTable = placementData.find(t =>
    t.heading?.toLowerCase().includes("recruiters") ||
    t.headers?.some((h:string) => h.toLowerCase().includes("companies"))
  )
  const allCompanies = recTable ? recTable.rows.flat().filter((c:any) => c && c.length > 2 && c !== '—' && c !== '-') : []
  const topTwoNames = allCompanies.slice(0, 2).join(", ")
  const finalRecruiters = allCompanies.length > 0 ? { names: topTwoNames, count: allCompanies.length } : null

  const cutoffData: any[] = micrositeData?.cutoff || college?.cutoff || []
  const firstCutoffTable = cutoffData[0] || null

  const admissionTables: any[] = micrositeData?.admission || college?.admission || []
  const firstAdmissionTable = admissionTables[0] || null
  const basicInfo = admissionTables[0]?.rows || []
  const admissionMode = basicInfo.find((r: any[]) => r[0]?.toString().toLowerCase().includes("mode"))?.[1] || "Online"
  const admissionBasis = basicInfo.find((r: any[]) => r[0]?.toString().toLowerCase().includes("basis"))?.[1] || "Merit/Entrance"
  const scholarshipAvail = basicInfo.find((r: any[]) => r[0]?.toString().toLowerCase().includes("scholarship"))?.[1] || "Available"

  const showAbout = !!(aboutText || vision || mission)
  const showCourses = !!firstFeeTable
  const showAdmission = !!admissionTables.length
  const showPlacement = !!(finalHighest || finalAverage || finalRecruiters)
  const showCutoff = !!firstCutoffTable
  const showContact = !!(college?.location || college?.url)

  // Short college name for the apply card heading
  const shortName = college.college_name
    ?.replace(/\b(university|college|institute|of|and|the)\b/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(' ') || college.college_name

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-4">

      {/* ── ABOUT + APPLY (parallel) ── */}
      {showAbout && (
        <section id="overview" className="scroll-mt-28 space-y-8">
          {/* Two-column layout: About content left, Apply card right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* LEFT: About content */}
            <div className="space-y-8">
              <SectionHeader label="Institutional Profile" title="About" accent="Us." />

              {aboutText && (
                <p className="text-base sm:text-lg text-slate-400 leading-loose font-medium italic pl-6 sm:pl-8 border-l-[6px] border-amber-500">
                  {aboutText}
                </p>
              )}

              {(vision || mission) && (
                <div className="grid md:grid-cols-2 gap-5">
                  {vision && (
                    <div className="relative p-7 rounded-[2rem] border border-white/10 bg-[#0F172B] hover:border-amber-500/40 overflow-hidden group transition-all duration-500" style={{ borderColor }}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 space-y-3">
                        <Eye className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-white font-black uppercase text-xs tracking-widest">Vision</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{vision}</p>
                      </div>
                    </div>
                  )}
                  {mission && (
                    <div className="relative p-7 rounded-[2rem] border border-white/10 bg-[#0F172B] hover:border-blue-500/40 overflow-hidden group transition-all duration-500" style={{ borderColor }}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 space-y-3">
                        <Target className="text-blue-500 w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-white font-black uppercase text-xs tracking-widest">Mission</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{mission}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Apply Directly card — sticky on large screens */}
            <div className="lg:sticky lg:top-28 h-full">
              <ApplyCard
                collegeName={shortName}
                url={college?.url}
              />
            </div>
          </div>
          
          <div className="block lg:hidden w-full">
            <CollegeEnquiryForm 
              collegeName={college.college_name} 
              pageSource={`/college/${slug}`} 
            />
          </div>
        </section>
      )}

      {/* ── COLLEGE MATCH CARD ── */}
      <CollegeMatchCard
        college={college}
        micrositeData={micrositeData}
        isProfileComplete={isProfileComplete}
      />

      {/* ── COURSES & FEES ── */}
      {showCourses && (
        <section id="courses" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Academic & Financials" title="Courses &" accent="Fees." />
          <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden" style={{ borderColor }}>
            <GraduationCap className="absolute -right-6 -top-6 w-32 h-32 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400">{firstFeeTable.heading || "Program Details"}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Preview Selection</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 px-4 md:px-6 py-5">
              <PreviewTable table={firstFeeTable} />
            </div>
          </div>
          <ViewFullLink href={`${base}/course-&-fees`} />
        </section>
      )}

      {/* ── ADMISSION ── */}
      {showAdmission && (
        <section id="admission" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Official Schedule" title="Admission" accent="Preview." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { l: 'Mode', v: admissionMode, Icon: Phone },
              { l: 'Basis', v: admissionBasis, Icon: Target },
              { l: 'Scholarship', v: scholarshipAvail, Icon: Award }
            ].map(({ l, v, Icon }, i) => (
              <div key={i} className="relative p-6 rounded-2xl border bg-[#0F172B] border-white/10 hover:border-amber-500/30 transition-all group" style={{ borderColor }}>
                <Icon className="w-5 h-5 mb-3 text-amber-500 opacity-60 group-hover:scale-110 transition-transform" />
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">{l}</p>
                <p className="text-base font-black text-white uppercase">{v}</p>
              </div>
            ))}
          </div>
          {firstAdmissionTable && (
            <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden" style={{ borderColor }}>
              <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">{firstAdmissionTable.heading || "Admission Info"}</h3>
              </div>
              <div className="relative z-10 px-4 md:px-6 py-5">
                <PreviewTable table={firstAdmissionTable} />
              </div>
            </div>
          )}
          <ViewFullLink href={`${base}/admission`} />
        </section>
      )}

      {/* ── PLACEMENT (SNAPSHOT) ── */}
      {showPlacement && (
        <section id="placement" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Industry Relations" title="Placement" accent="Snapshot." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {finalHighest && (
              <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0F172B] hover:border-amber-500/30 transition-all group">
                <Award className="w-5 h-5 mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Highest Package</p>
                <p className="text-2xl font-black text-white">{finalHighest}</p>
              </div>
            )}
            {finalAverage && (
              <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0F172B] hover:border-blue-500/30 transition-all group">
                <BarChart3 className="w-5 h-5 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Average Package</p>
                <p className="text-2xl font-black text-white">{finalAverage}</p>
              </div>
            )}
            {finalRecruiters && (
              <div className="relative p-6 rounded-2xl border border-white/10 bg-[#0F172B] hover:border-purple-500/30 transition-all group">
                <Building2 className="w-5 h-5 mb-3 text-purple-500 group-hover:scale-110 transition-transform" />
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Top Recruiters ({finalRecruiters.count}+)</p>
                <p className="text-sm font-black text-white uppercase truncate">{finalRecruiters.names}</p>
              </div>
            )}
          </div>
          <ViewFullLink href={`${base}/placement`} />
        </section>
      )}

      {/* ── CUTOFF ── */}
      {showCutoff && (
        <section id="cutoff" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Official Data" title="Cutoff" accent="Preview." />
          <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden" style={{ borderColor }}>
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">{firstCutoffTable.heading || "Cutoff Preview"}</h3>
            </div>
            <div className="relative z-10 px-4 md:px-6 py-5">
              <PreviewTable table={firstCutoffTable} />
            </div>
          </div>
          <ViewFullLink href={`${base}/cutoff`} />
        </section>
      )}

      {/* ── CONTACT ── */}
      {showContact && (
        <section id="contact" className="scroll-mt-28 space-y-6 pb-12">
          <SectionHeader label="Official Channels" title="Contact" accent="Information." />
          <div className="space-y-4">
            {college.location && (
              <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40" style={{ borderColor }}>
                <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400">Campus Locale</h3>
                </div>
                <div className="relative z-10 px-6 md:px-8 py-5">
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">{college.location}</p>
                </div>
              </div>
            )}
            {college.url && (
              <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40" style={{ borderColor }}>
                <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400">Digital Portal</h3>
                </div>
                <div className="relative z-10 px-6 md:px-8 py-5">
                  <a href={college.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-300 font-medium text-sm hover:text-amber-400">
                    {college.url.replace('https://', '').replace('www.', '')}
                    <ArrowUpRight size={14} className="text-amber-500" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}