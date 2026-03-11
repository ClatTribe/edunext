"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Star, ChevronDown, BarChart3 } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  const cleaned = val.toString().replace(/Compare$/i, '').trim()
  return cleaned || '—'
}

// ─── Unified Table Component ────────────────────────────────────────────────

function ProperTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: any[][] = table.rows || []

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#050818]/40 custom-scrollbar">
      {/* Custom Scrollbar Styling */}
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
                className={`px-6 py-4 text-left font-black uppercase tracking-widest whitespace-nowrap border-b-2 border-white/20 border-r border-white/10
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
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="hover:bg-amber-500/[0.04] transition-colors group/tr"
            >
              {Array.isArray(row) ? (
                row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-6 py-4 text-sm font-medium transition-colors border-b border-white/20 border-r border-white/10
                      ${ci === 0
                        ? 'text-slate-200 bg-[#070d1e] group-hover/tr:text-white'
                        : 'text-slate-400 group-hover/tr:text-amber-400'}`}
                  >
                    <span className={ci !== 0 && !isNaN(Number(cell)) ? "font-black text-white group-hover/tr:text-amber-400" : ""}>
                      {ci !== 0 && !isNaN(Number(cell)) && cell !== '' ? `#${cleanCell(cell)}` : cleanCell(cell)}
                    </span>
                  </td>
                ))
              ) : (
                <td colSpan={headers.length} className="px-6 py-4 text-slate-500 italic text-center border-b border-white/20">
                  Data format error
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Auto-detect and normalize ranking tables */
function AutoTable({ table }: { table: any }) {
  const rows: any[][] = table.rows || []
  if (rows.length === 0) return null

  const firstRow = rows[0]
  const looksLikeHeader = Array.isArray(firstRow) && firstRow.every(cell => isNaN(parseFloat(cell)))
  
  if ((!table.headers || table.headers.length === 0) && looksLikeHeader && rows.length > 1) {
    return <ProperTable table={{ ...table, headers: firstRow, rows: rows.slice(1) }} />
  }

  if (!table.headers || table.headers.length === 0) {
    const colCount = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)), 0)
    const synthetic = Array.from({ length: colCount }, (_, i) => i === 0 ? 'Agency / Stream' : `Year ${2025 - i}`)
    return <ProperTable table={{ ...table, headers: synthetic }} />
  }

  return <ProperTable table={table} />
}

// ─── Ranking Card Wrapper ───────────────────────────────────────────────────

function RankingCard({ table }: { table: any }) {
  const title = table.heading?.trim()

  return (
    <div
      className="group relative rounded-[2rem] border transition-all duration-700 shadow-xl overflow-hidden bg-[#0F172B]
                  hover:border-amber-500/40"
      style={{ borderColor }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {title && (
        <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                        group-hover:scale-110 transition-transform duration-500 shrink-0"
            style={{ borderColor, color: accentColor }}
          >
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Excellence Benchmarks
            </p>
          </div>
        </div>
      )}

      <div className={`relative z-10 px-6 md:px-8 ${title ? 'py-8' : 'pt-6 pb-8'}`}>
        <AutoTable table={table} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RankingPage() {
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
        const rawRanking = mData?.ranking || data?.ranking || []
        
        if (rawRanking.length > 0) {
          setSelectedHeading(rawRanking[0].heading?.trim() || "General Recognition")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCollege()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </div>
    )
  }

  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : college?.microsite_data

  const rankingData: any[] = micrositeData?.ranking || college?.ranking || []

  // Unique Headings for Dropdown
  const uniqueHeadings = Array.from(new Set(rankingData.map(item => item.heading?.trim() || "General Recognition")))
  
  // Filter tables belonging to selected heading
  const visibleTables = rankingData.filter(item => (item.heading?.trim() || "General Recognition") === selectedHeading)

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-20">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Global Accreditations</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Rankings & <span className="text-amber-500">Recognition.</span>
        </h1>
      </div>

      {/* Dropdown Selector */}
      {uniqueHeadings.length > 0 && (
        <div className="relative max-w-xl group">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block ml-1">
            Browse Ranking Categories
          </label>
          <div className="relative flex items-center">
            <select
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
              className="w-full appearance-none bg-[#0F172B] border border-white/10 text-white px-6 pr-14 py-4 rounded-2xl 
                         font-bold text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500/50 
                         transition-all cursor-pointer hover:bg-[#161f35] shadow-2xl truncate"
            >
              {uniqueHeadings.map((heading, idx) => (
                <option key={idx} value={heading} className="bg-[#0F172B]">
                  {heading}
                </option>
              ))}
            </select>
            <div className="absolute right-5 pointer-events-none text-amber-500">
              <ChevronDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* Grouped Tables */}
      <div 
        key={selectedHeading} 
        className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
      >
        {visibleTables.length > 0 ? (
          visibleTables.map((table, index) => (
            <RankingCard key={index} table={table} />
          ))
        ) : (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-10 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Verification in Progress</h3>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-medium">Updating latest ranking data</p>
          </div>
        )}
      </div>
    </div>
  )
}