"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "../../../../lib/supabase"
import { useParams, usePathname } from "next/navigation"
import {
  Loader2, Eye, Target, Phone, Globe, GraduationCap,
  MapPin, ArrowUpRight, BarChart3, Wallet, Award,
  Building2, Headset, ChevronRight
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

// ─── Preview Table (first table, max 3 rows, no accordion) ───────────────────

function PreviewTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  // Flatten rows — if complex (base_data), just take base_data
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
      {/* Fade-out if more rows exist */}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollegeOverviewPage() {
  const params = useParams()
  const pathname = usePathname()
  const slug = params?.slug as string

  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCollege() }, [slug])

  useEffect(() => {
    const urlParts = pathname.split('/')
    const section = urlParts[urlParts.length - 1]
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [pathname])

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

  const micrositeData = typeof college.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : (college.microsite_data || {})

  const base = `/college/${slug}`

  // Data
  const aboutText: string = college.about || micrositeData?.about || ""
  const vision: string    = micrositeData?.about_section?.vision || ""
  const mission: string   = micrositeData?.about_section?.mission || ""

  const rawFees: any[]       = micrositeData?.fees || college?.fees || []
  const firstFeeTable        = rawFees[0] || null

  const placementData: any[] = micrositeData?.placement || college?.placement || []
  const highestPackage       = placementData[0]?.headers?.[1] || placementData[0]?.rows?.find((r: any) => r[0]?.toLowerCase().includes("high"))?.[1] || null
  const averagePackage       = placementData[0]?.rows?.[0]?.[1] || null
  const uniqueRecruiters     = [...new Set([
    ...(placementData[0]?.rows?.[1]?.[1] || '').split(',').map((r: string) => r.trim()).filter(Boolean),
    ...(placementData[1]?.rows || []).flat().filter(Boolean),
  ])] as string[]

  const cutoffData: any[]    = micrositeData?.cutoff || college?.cutoff || []
  const firstCutoffTable     = cutoffData[0] || null

  const admissionTables: any[] = micrositeData?.admission || college?.admission || []
  const firstAdmissionTable    = admissionTables[0] || null
  const basicInfo              = admissionTables[0]?.rows || []
  const admissionMode          = basicInfo.find((r: any[]) => r[0] === "Mode of Application")?.[1] || "Offline"
  const admissionBasis         = basicInfo.find((r: any[]) => r[0] === "Basis of Admission")?.[1] || "Merit Based"
  const scholarshipAvail       = basicInfo.find((r: any[]) => r[0] === "Scholarship")?.[1] || "Yes"

  // Visibility
  const showAbout     = !!(aboutText || vision || mission)
  const showCourses   = !!firstFeeTable
  const showAdmission = !!admissionTables.length
  const showPlacement = !!placementData.length
  const showCutoff    = !!firstCutoffTable
  const showContact   = !!(college?.location || college?.url)

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-4">

      {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
      {showAbout && (
        <section id="overview" className="scroll-mt-28 space-y-8">
          <SectionHeader label="Institutional Profile" title="About" accent="Us." />

          {aboutText && (
            <p className="text-base sm:text-lg text-slate-400 leading-loose font-medium italic pl-6 sm:pl-8"
              style={{ borderLeft: `6px solid ${accentColor}` }}>
              {aboutText}
            </p>
          )}

          {(vision || mission) && (
            <div className="grid md:grid-cols-2 gap-5">
              {vision && (
                <div className="relative p-7 rounded-[2rem] border transition-all duration-500 hover:border-amber-500/40 overflow-hidden group"
                  style={{ backgroundColor: secondaryBg, borderColor }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-3">
                    <Eye className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Vision</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{vision}</p>
                  </div>
                </div>
              )}
              {mission && (
                <div className="relative p-7 rounded-[2rem] border transition-all duration-500 hover:border-blue-500/40 overflow-hidden group"
                  style={{ backgroundColor: secondaryBg, borderColor }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-3">
                    <Target className="text-blue-500 w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
                    <h4 className="text-white font-black uppercase text-xs tracking-widest">Mission</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{mission}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── COURSES & FEES (first table, 3 rows) ───────────────────────────── */}
      {showCourses && (
        <section id="courses" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Academic & Financials" title="Courses &" accent="Fees." />

          <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden"
            style={{ borderColor }}>
            <GraduationCap className="absolute -right-6 -top-6 w-32 h-32 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                  {firstFeeTable.heading || "Program Details"}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Preview — First 3 Programs</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 px-4 md:px-6 py-5">
              <PreviewTable table={firstFeeTable} />
            </div>
          </div>

          <ViewFullLink href={`${base}/course-&-fees`} label="View All Courses & Fees" />
        </section>
      )}

      {/* ── ADMISSION ──────────────────────────────────────────────────────── */}
      {showAdmission && (
        <section id="admission" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Official Schedule" title="Admission" accent="Preview." />

          {/* Stat pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { l: 'Mode', v: admissionMode, Icon: Phone },
              { l: 'Basis', v: admissionBasis, Icon: Target },
              { l: 'Scholarship', v: scholarshipAvail, Icon: Award }
            ].map(({ l, v, Icon }, i) => (
              <div key={i}
                className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 overflow-hidden group"
                style={{ backgroundColor: secondaryBg, borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <Icon className="w-5 h-5 mb-3 text-amber-500 opacity-60 group-hover:scale-110 transition-transform" />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">{l}</p>
                  <p className="text-base font-black text-white uppercase">{v}</p>
                </div>
              </div>
            ))}
          </div>

          {/* First table, 3 rows */}
          {firstAdmissionTable && (
            <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden"
              style={{ borderColor }}>
              <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                    {firstAdmissionTable.heading || "Admission Info"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Preview — First 3 Entries</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 px-4 md:px-6 py-5">
                <PreviewTable table={firstAdmissionTable} />
              </div>
            </div>
          )}

          <ViewFullLink href={`${base}/admission`} label="View Full Admission Details" />
        </section>
      )}

      {/* ── PLACEMENT (stat pills only) ────────────────────────────────────── */}
      {showPlacement && (
        <section id="placement" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Industry Relations" title="Placement" accent="Snapshot." />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {highestPackage && (
              <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-amber-500/30 overflow-hidden group"
                style={{ backgroundColor: secondaryBg, borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <Award className="w-5 h-5 mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Highest Package</p>
                  <p className="text-2xl font-black text-white">{highestPackage}</p>
                </div>
              </div>
            )}
            {averagePackage && (
              <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-blue-500/30 overflow-hidden group"
                style={{ backgroundColor: secondaryBg, borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <BarChart3 className="w-5 h-5 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Average Package</p>
                  <p className="text-2xl font-black text-white">{averagePackage}</p>
                </div>
              </div>
            )}
            {uniqueRecruiters.length > 0 && (
              <div className="relative p-6 rounded-2xl border transition-all duration-500 hover:border-purple-500/30 overflow-hidden group"
                style={{ backgroundColor: secondaryBg, borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <Building2 className="w-5 h-5 mb-3 text-purple-500 group-hover:scale-110 transition-transform" />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Top Recruiters</p>
                  <p className="text-2xl font-black text-white">{uniqueRecruiters.length}+</p>
                </div>
              </div>
            )}
          </div>

          <ViewFullLink href={`${base}/placement`} label="View Full Placement Report" />
        </section>
      )}

      {/* ── CUTOFF (first table, 3 rows) ───────────────────────────────────── */}
      {showCutoff && (
        <section id="cutoff" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Official Data" title="Cutoff" accent="Preview." />

          <div className="group relative rounded-[2rem] border transition-all duration-500 bg-[#0F172B] hover:border-amber-500/40 shadow-xl overflow-hidden"
            style={{ borderColor }}>
            <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                  {firstCutoffTable.heading || "Cutoff Data"}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Preview — First 3 Entries</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 px-4 md:px-6 py-5">
              <PreviewTable table={firstCutoffTable} />
            </div>
          </div>

          <ViewFullLink href={`${base}/cutoff`} label="View Full Cutoff Data" />
        </section>
      )}

      {/* ── CONTACT ────────────────────────────────────────────────────────── */}
      {showContact && (
        <section id="contact" className="scroll-mt-28 space-y-6">
          <SectionHeader label="Official Channels" title="Contact" accent="Information." />

          <div className="space-y-4">
            {college?.location && (
              <div className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B] hover:border-amber-500/40"
                style={{ borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] group-hover:scale-110 transition-transform duration-500 shrink-0"
                    style={{ borderColor, color: accentColor }}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">Campus Locale</h3>
                </div>
                <div className="relative z-10 px-6 md:px-8 py-5">
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">{college.location}</p>
                </div>
              </div>
            )}

            {college?.url && (
              <div className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B] hover:border-amber-500/40"
                style={{ borderColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 pb-5 border-b border-white/5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-[#050818] group-hover:scale-110 transition-transform duration-500 shrink-0"
                    style={{ borderColor, color: accentColor }}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">Digital Portal</h3>
                </div>
                <div className="relative z-10 px-6 md:px-8 py-5">
                  <a href={college.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-300 font-medium text-sm hover:text-amber-400 transition-colors">
                    {college.url.replace('https://', '').replace('www.', '')}
                    <ArrowUpRight size={14} className="text-amber-500" />
                  </a>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="group relative p-8 rounded-[2rem] border border-white/5 bg-[#050818] overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-500/30">
              <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Headset size={16} className="text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                      Admission <span className="text-amber-500">Desk.</span>
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-400 max-w-sm leading-relaxed">
                    Connect with the official administration for personalized counseling and direct admission queries.
                  </p>
                </div>
                {college?.url && (
                  <a href={college.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3.5 px-8 bg-amber-500 text-[#050818] rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest shrink-0">
                    Apply Directly
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}