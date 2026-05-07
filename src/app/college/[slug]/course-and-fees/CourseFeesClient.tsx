"use client"
import React, { useState, useEffect } from "react"
import { BarChart3, ChevronDown, GraduationCap, Wallet } from "lucide-react"

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

function ProperTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: any[] = table.rows || []
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx)
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#050818]/40 custom-scrollbar">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
        }
      `}</style>

      <table className="w-full text-sm border-separate border-spacing-0 min-w-[600px]">
        <thead>
          <tr className="bg-white/[0.04]">
            {headers.map((h, hi) => (
              <th
                key={hi}
                className={`px-6 py-5 text-left font-black uppercase tracking-widest whitespace-nowrap border-b-2 border-white/20 border-r border-white/10
                  ${hi === 0 
                    ? 'text-slate-200 bg-[#070d1e]' 
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
                      className={`px-6 py-5 text-sm font-medium border-b border-white/20 border-r border-white/10 transition-colors
                        ${ci === 0
                          ? 'text-slate-200 bg-[#070d1e] group-hover/tr:text-white'
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
                    <td colSpan={headers.length} className="p-0 border-b border-white/20">
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-black/40 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6">
                          <div className="rounded-xl border border-amber-500/20 bg-[#070d1e] overflow-hidden shadow-2xl">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-white/5">
                                  {row.sub_courses[0]?.map((subH: any, shi: number) => (
                                    <th key={shi} className="px-4 py-3 text-left font-black text-amber-500 uppercase tracking-tighter border-b border-white/10">{subH}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {row.sub_courses.slice(1).map((subRow: any[], si: number) => (
                                  <tr key={si} className="hover:bg-white/[0.03] transition-colors">
                                    {subRow.map((val: any, vi: number) => (
                                      <td key={vi} className="px-4 py-4 text-slate-300 font-medium border-r border-white/5">{cleanCell(val)}</td>
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

interface CourseFeesClientProps {
  rawFees: any[];
  uniqueHeadings: string[];
}

export default function CourseFeesClient({ rawFees, uniqueHeadings }: CourseFeesClientProps) {
  const [selectedHeading, setSelectedHeading] = useState<string>("")

  useEffect(() => {
    if (uniqueHeadings.length > 0) {
      setSelectedHeading(uniqueHeadings[0])
    }
  }, [uniqueHeadings])

  const visibleTables = rawFees.filter(item => (item.heading?.trim() || "General Courses") === selectedHeading)
  const borderColor = 'rgba(245, 158, 11, 0.15)'

  return (
    <>
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
                  <div className="relative z-10 flex items-center gap-4 px-8 pt-8 pb-6 border-b border-white/10">
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
    </>
  )
}
