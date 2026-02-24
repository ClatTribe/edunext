"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, Wallet, BarChart3, ChevronDown, GraduationCap } from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

// ─── Unified Table Component (Handles Simple & Complex Rows) ────────────────

function ProperTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: any[] = table.rows || []
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx)
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050818]/40">
      <table className="w-full text-sm border-separate border-spacing-0 min-w-[600px]">
        <thead>
          <tr className="bg-white/[0.02]">
            {headers.map((h, hi) => (
              <th
                key={hi}
                className={`px-6 py-5 text-left font-black uppercase tracking-widest whitespace-nowrap border-b border-white/10
                  ${hi === 0 
                    ? 'text-slate-200 sticky left-0 z-20 bg-[#070d1e]' 
                    : 'text-amber-500/90 bg-[#070d1e]'}`}
              >
                {h || '—'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isComplex = !Array.isArray(row) && row?.base_data
            const displayData = isComplex ? row.base_data : row
            const hasSubCourses = isComplex && row.sub_courses?.length > 0
            const isExpanded = expandedRow === ri

            if (!Array.isArray(displayData)) return null

            return (
              <React.Fragment key={ri}>
                <tr
                  onClick={() => hasSubCourses && toggleRow(ri)}
                  className={`group/tr transition-all duration-300 
                    ${hasSubCourses ? 'cursor-pointer hover:bg-amber-500/[0.08]' : 'hover:bg-white/[0.02]'}
                    ${isExpanded ? 'bg-amber-500/[0.05]' : ''}`}
                >
                  {displayData.map((cell: any, ci: number) => (
                    <td
                      key={ci}
                      className={`px-6 py-5 text-sm font-medium border-b border-white/[0.04] transition-colors
                        ${ci === 0
                          ? 'text-slate-200 sticky left-0 z-10 bg-[#050818] group-hover/tr:text-white'
                          : 'text-slate-400 group-hover/tr:text-amber-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        {ci === 0 && hasSubCourses && (
                          <div className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                             <ChevronDown className="w-5 h-5 text-amber-500 stroke-[3px]" />
                          </div>
                        )}
                        <span className={ci === 0 ? "font-bold tracking-tight" : ""}>
                          {cleanCell(cell)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {hasSubCourses && (
                  <tr>
                    <td colSpan={headers.length} className="p-0 border-b border-white/[0.04]">
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-black/40 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6">
                          <div className="rounded-xl border border-amber-500/20 bg-[#070d1e] overflow-hidden shadow-2xl">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-white/5">
                                  {row.sub_courses[0]?.map((subH: any, shi: number) => (
                                    <th key={shi} className="px-4 py-3 text-left font-black text-amber-500 uppercase tracking-tighter">{subH}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {row.sub_courses.slice(1).map((subRow: any[], si: number) => (
                                  <tr key={si} className="hover:bg-white/[0.03] transition-colors">
                                    {subRow.map((val, vi) => (
                                      <td key={vi} className="px-4 py-4 text-slate-300 font-medium">{cleanCell(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function CoursesAndFeesPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
        setCollege(data)
      } finally {
        setLoading(false)
      }
    }
    fetchCollege()
  }, [slug])

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="animate-spin h-12 w-12 text-amber-500" />
    </div>
  )

  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : college?.microsite_data

  // Focusing strictly on Fees data as it contains course/eligibility info
  const rawFees: any[] = micrositeData?.fees || college?.fees || []

  // Reorder: Put the "Master" tables (with sub-courses/accordion) at the top
  const sortedFees = [...rawFees].sort((a, b) => {
    const aIsComplex = a.rows?.some((r: any) => !Array.isArray(r) && r.base_data) ? 1 : 0
    const bIsComplex = b.rows?.some((r: any) => !Array.isArray(r) && r.base_data) ? 1 : 0
    return bIsComplex - aIsComplex
  })

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 py-12">
      {/* Dynamic Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-12 bg-amber-500" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">Academic & Financials</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          Courses & <span className="text-amber-500">Fees.</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium max-w-2xl">
          Explore comprehensive program details, eligibility criteria, and detailed fee structures for all available departments.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-12">
        {sortedFees.length > 0 ? (
          sortedFees.map((table, index) => (
            <div
              key={index}
              className="group relative rounded-[2.5rem] border transition-all duration-700 bg-[#0F172B] hover:border-amber-500/40 shadow-2xl overflow-hidden"
              style={{ borderColor }}
            >
              {/* Decorative Background Icon */}
              <GraduationCap className="absolute -right-8 -top-8 w-40 h-40 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4 px-8 pt-8 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                    {table.heading || "Program Details"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Academic Schedule</p>
                  </div>
                </div>
              </div>

              <div className="px-4 md:px-8 py-8 relative z-10">
                <ProperTable table={table} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
            <BarChart3 className="w-16 h-16 mx-auto mb-6 opacity-20 text-amber-500" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Data verification in progress</p>
          </div>
        )}
      </div>
    </div>
  )
}