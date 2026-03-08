"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { BarChart3, Loader2, Target, TrendingDown, TrendingUp, Minus, ChevronDown } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: string): string {
  return val?.toString().replace(/Compare$/i, '').trim() || '—'
}

function getTrend(val1: string, val2: string): 'up' | 'down' | 'same' | null {
  const n1 = parseFloat(val1?.toString().replace(/[^0-9.]/g, ''))
  const n2 = parseFloat(val2?.toString().replace(/[^0-9.]/g, ''))
  if (isNaN(n1) || isNaN(n2) || val2 === '-' || val1 === '-') return null
  return n1 < n2 ? 'up' : n1 > n2 ? 'down' : 'same'
}

// ─── Unified Table Component ────────────────────────────────────────────────

function ProperTable({ cutoff }: { cutoff: any }) {
  const headers: string[] = cutoff.headers || []
  const rows: any[][] = cutoff.rows || []
  const colCount = headers.length

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050818]/40">
      <table className="w-full text-sm border-separate border-spacing-0 min-w-[400px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {headers.map((h, hi) => (
              <th
                key={hi}
                className={`px-6 py-4 text-left font-black uppercase tracking-widest whitespace-nowrap
                  ${hi === 0 
                    ? 'text-slate-200 sticky left-0 z-10 bg-[#070d1e]' 
                    : 'text-amber-500/90 bg-[#070d1e]'}`}
              >
                {h || '—'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const trend = colCount >= 3 ? getTrend(row[1], row[2]) : null
            return (
              <tr
                key={ri}
                className="border-b border-white/[0.04] hover:bg-amber-500/[0.04] transition-colors group/tr"
              >
                {Array.isArray(row) && row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-6 py-4 text-sm font-medium transition-colors
                      ${ci === 0
                        ? 'text-slate-400 sticky left-0 group-hover/tr:text-white bg-[#050818]/80'
                        : 'text-slate-300 group-hover/tr:text-amber-400'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {ci === 1 && trend && (
                        <span className={`shrink-0 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                          {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                        </span>
                      )}
                      <span>{cleanCell(cell)}</span>
                    </div>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RawTable({ cutoff }: { cutoff: any }) {
  const rows: any[][] = cutoff.rows || []
  if (rows.length === 0) return null

  const firstRow = rows[0]
  const looksLikeHeader = Array.isArray(firstRow) && firstRow.every(cell => isNaN(parseFloat(cell)))

  if (looksLikeHeader && rows.length > 1) {
    return <ProperTable cutoff={{ ...cutoff, headers: firstRow, rows: rows.slice(1) }} />
  }

  const colCount = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)), 0)
  const syntheticHeaders = colCount === 2 ? ['Category', 'Value'] : Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`)
  
  return <ProperTable cutoff={{ ...cutoff, headers: syntheticHeaders }} />
}

// ─── Wrapper Card ───────────────────────────────────────────────────────────

function CutoffCard({ cutoff }: { cutoff: any }) {
  const title = cutoff.heading?.trim()
  const hasHeaders = cutoff.headers && cutoff.headers.length > 0

  return (
    <div
      className="group relative rounded-[2rem] border transition-all duration-700 shadow-xl overflow-hidden bg-[#0F172B]
                 hover:border-amber-500/40"
      style={{ borderColor }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {title && (
        <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                       group-hover:scale-110 transition-transform duration-500 shrink-0"
            style={{ borderColor, color: accentColor }}
          >
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
              {title}
            </h3>
          </div>
        </div>
      )}

      <div className={`relative z-10 px-6 md:px-8 ${title ? 'py-6' : 'pt-10 pb-8'}`}>
        {!hasHeaders ? <RawTable cutoff={cutoff} /> : <ProperTable cutoff={cutoff} />}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CutoffPage() {
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
        const rawCutoff = mData?.cutoff || data?.cutoff || []
        
        if (rawCutoff.length > 0) {
          setSelectedHeading(rawCutoff[0].heading?.trim() || "General Data")
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
  const cutoffData: any[] = micrositeData?.cutoff || college?.cutoff || []

  // Unique Headings for Dropdown
  const uniqueHeadings = Array.from(new Set(cutoffData.map(item => item.heading?.trim() || "General Data")))
  
  // Filter tables belonging to selected heading
  const visibleTables = cutoffData.filter(item => (item.heading?.trim() || "General Data") === selectedHeading)

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-20">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Official Data</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Admission <span className="text-amber-500">Thresholds.</span>
        </h1>
      </div>

      {/* Dropdown Selector with Overlap Fix */}
      {uniqueHeadings.length > 0 && (
        <div className="relative max-w-xl group">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block ml-1">
            Browse Exam Categories
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

      {/* Grouped Tables with Smooth Animation */}
      <div 
        key={selectedHeading} 
        className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
      >
        {visibleTables.length > 0 ? (
          visibleTables.map((cutoff, index) => (
            <CutoffCard key={index} cutoff={cutoff} />
          ))
        ) : (
          <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">No Data Found</h3>
          </div>
        )}
      </div>
    </div>
  )
}