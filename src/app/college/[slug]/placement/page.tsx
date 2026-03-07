"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Award, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

function getTrend(val1: any, val2: any): 'up' | 'down' | 'same' | null {
  const n1 = parseFloat(val1?.toString().replace(/[^0-9.]/g, ''))
  const n2 = parseFloat(val2?.toString().replace(/[^0-9.]/g, ''))
  if (isNaN(n1) || isNaN(n2)) return null
  if (n1 > n2) return 'up'
  if (n1 < n2) return 'down'
  return 'same'
}

// ─── Unified Table Component ────────────────────────────────────────────────

function ProperTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: any[][] = table.rows || []
  const colCount = headers.length

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050818]/40">
      <table className="w-full text-sm border-collapse min-w-[600px]">
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
            // Trend logic: Compare current year (col 1) vs previous year (col 2) if available
            const trend = colCount >= 3 ? getTrend(row[1], row[2]) : null
            
            return (
              <tr
                key={ri}
                className="border-b border-white/[0.04] hover:bg-amber-500/[0.04] transition-colors group/tr"
              >
                {Array.isArray(row) ? (
                  row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-6 py-4 text-sm font-medium transition-colors
                        ${ci === 0
                          ? 'text-slate-300 sticky left-0 group-hover/tr:text-white bg-[#050818]/80'
                          : 'text-slate-400 group-hover/tr:text-amber-400'}`}
                    >
                      <div className="flex items-center gap-2">
                        {ci === 1 && trend && (
                          <span className={`shrink-0 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                          </span>
                        )}
                        <span>{cleanCell(cell)}</span>
                      </div>
                    </td>
                  ))
                ) : (
                  <td colSpan={headers.length} className="px-6 py-4 text-slate-500 italic text-center">
                    Data format error
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Auto-detect and normalize placement tables */
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
    const synthetic = Array.from({ length: colCount }, (_, i) => i === 0 ? 'Statistic' : `Value ${i}`)
    return <ProperTable table={{ ...table, headers: synthetic }} />
  }

  return <ProperTable table={table} />
}

// ─── Placement Card Wrapper ────────────────────────────────────────────────

function PlacementCard({ table, index }: { table: any; index: number }) {
  const title = table.heading?.trim()

  return (
    <div
      className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B]
                 hover:border-amber-500/40 hover:-translate-y-1"
      style={{ borderColor }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                     group-hover:scale-110 transition-transform duration-500 shrink-0"
          style={{ borderColor, color: accentColor }}
        >
          <Award className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
            {title}
          </h3>
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-8 py-8">
        <AutoTable table={table} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PlacementPage() {
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

  const placementData: any[] = micrositeData?.placement || college?.placement || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Industry Relations</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Placement <span className="text-amber-500">Metrics.</span>
        </h1>
      </div>

      {/* Tables List */}
      <div className="space-y-10">
        {placementData.length > 0 ? (
          placementData.map((table, index) => <PlacementCard key={index} table={table} index={index} />)
        ) : (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-10 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Awaiting Stats</h3>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-medium">Verifying 2024-25 placement reports</p>
          </div>
        )}
      </div>
    </div>
  )
}