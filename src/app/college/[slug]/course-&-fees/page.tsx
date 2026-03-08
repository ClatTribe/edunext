"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Loader2, Wallet, BarChart3, ChevronDown, GraduationCap } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

// ─── Unified Table Component ────────────────────────────────────────────────

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
                                    {subRow.map((val: any, vi: number) => (
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
  const [selectedHeading, setSelectedHeading] = useState<string>("")

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
        setCollege(data)
        
        const mData = typeof data?.microsite_data === 'string' ? JSON.parse(data.microsite_data) : data?.microsite_data
        const rawFees = mData?.fees || data?.fees || []
        if (rawFees.length > 0) {
          setSelectedHeading(rawFees[0].heading?.trim() || "General Courses")
        }
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

  const rawFees: any[] = micrositeData?.fees || college?.fees || []
  const uniqueHeadings = Array.from(new Set(rawFees.map(item => item.heading?.trim() || "General Courses")))
  const visibleTables = rawFees.filter(item => (item.heading?.trim() || "General Courses") === selectedHeading)

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 py-12 pb-24">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-12 bg-amber-500" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">Academic & Financials</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          Courses & <span className="text-amber-500">Fees.</span>
        </h1>
      </div>

      {/* FIXED Dropdown Selector: Added pr-14 to prevent icon overlap */}
      {uniqueHeadings.length > 0 && (
        <div className="relative max-w-xl w-full group">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block ml-1">
            Browse Academic Departments
          </label>
          <div className="relative flex items-center">
            <select
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
              className="w-full appearance-none bg-[#0F172B] border border-white/10 text-white px-6 pr-14 py-5 rounded-[1.5rem] 
                         font-bold text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500/50 
                         transition-all cursor-pointer hover:bg-[#161f35] shadow-2xl truncate"
            >
              {uniqueHeadings.map((heading, idx) => (
                <option key={idx} value={heading} className="bg-[#0F172B]">
                  {heading}
                </option>
              ))}
            </select>
            <div className="absolute right-6 pointer-events-none text-amber-500">
              <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        key={selectedHeading} 
        className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
      >
        {visibleTables.length > 0 ? (
          visibleTables.map((table, index) => {
            const title = table.heading?.trim()
            return (
              <div
                key={index}
                className="group relative rounded-[2.5rem] border transition-all duration-700 bg-[#0F172B] hover:border-amber-500/40 shadow-2xl overflow-hidden"
                style={{ borderColor }}
              >
                <GraduationCap className="absolute -right-8 -top-8 w-40 h-40 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />

                {title && (
                  <div className="relative z-10 flex items-center gap-4 px-8 pt-8 pb-6 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-[#050818] border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Structure</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`px-4 md:px-8 relative z-10 ${title ? 'py-8' : 'pt-10 pb-8'}`}>
                  <ProperTable table={table} />
                </div>
              </div>
            )
          })
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