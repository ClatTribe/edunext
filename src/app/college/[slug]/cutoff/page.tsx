"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { BarChart3, Loader2, Target, TrendingDown, TrendingUp, Minus } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function isMultiColTable(cutoff: any): boolean {
  return cutoff.headers?.length > 2
}

function isSimpleTable(cutoff: any): boolean {
  return cutoff.headers?.length === 2
}

/**
 * Title priority:
 * 1. cutoff.heading  (non-empty string)
 * 2. fallback index label
 */
function getTitle(cutoff: any, index: number): string {
  if (cutoff.heading && cutoff.heading.trim() !== '') return cutoff.heading.trim()
  return `Cutoff Table ${index + 1}`
}

/** Clean junk suffixes like "Compare" from cell values */
function cleanCell(val: string): string {
  return val?.toString().replace(/Compare$/i, '').trim() || '—'
}

/** Detect trend: lower rank = better, so if current < previous → improved (up) */
function getTrend(val1: string, val2: string): 'up' | 'down' | 'same' | null {
  const n1 = parseFloat(val1?.toString().replace(/[^0-9.]/g, ''))
  const n2 = parseFloat(val2?.toString().replace(/[^0-9.]/g, ''))
  if (isNaN(n1) || isNaN(n2) || val2 === '-' || val1 === '-') return null
  if (n1 < n2) return 'up'
  if (n1 > n2) return 'down'
  return 'same'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Simple 2-column card-style layout */
function SimpleTable({ cutoff }: { cutoff: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {cutoff.rows.map((row: string[], i: number) => (
        <div
          key={i}
          className="group/row flex items-center justify-between px-5 py-4 rounded-2xl border border-white/5
                     bg-[#050818]/70 hover:border-amber-500/40 hover:bg-amber-500/[0.06] transition-all duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/30 group-hover/row:bg-amber-400 transition-colors shrink-0" />
            <span className="text-slate-300 text-xs font-semibold uppercase tracking-wide truncate group-hover/row:text-white transition-colors">
              {cleanCell(row[0])}
            </span>
          </div>
          <div className="text-right shrink-0 ml-3">
            <span className="text-white font-black text-lg tracking-tighter group-hover/row:text-amber-400 transition-colors">
              {cleanCell(row[1])}
            </span>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
              {cutoff.headers?.[1] || 'Cutoff'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Multi-column full table (year-wise / round-wise / multiple metrics) */
function MultiColTable({ cutoff }: { cutoff: any }) {
  const headers: string[] = cutoff.headers || []
  const rows: string[][] = cutoff.rows || []
  const colCount = headers.length

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-sm border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h, hi) => (
              <th
                key={hi}
                className={`px-4 py-3 text-left font-bold text-[10px] uppercase tracking-widest whitespace-nowrap
                  ${hi === 0
                    ? 'text-slate-400 bg-[#050818] sticky left-0 z-10 min-w-[160px]'
                    : hi === 1
                    ? 'text-amber-400 bg-[#070d1e]'
                    : 'text-slate-500 bg-[#070d1e]'
                  }`}
              >
                {h}
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
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3 font-semibold
                      ${ci === 0
                        ? 'text-slate-300 text-xs bg-[#050818]/80 sticky left-0 group-hover/tr:text-white transition-colors'
                        : ci === 1
                        ? 'text-white font-black text-sm group-hover/tr:text-amber-400 transition-colors'
                        : 'text-slate-400 text-xs'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {ci === 1 && trend && (
                        <span className={`shrink-0 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                          {trend === 'up'
                            ? <TrendingUp className="w-3 h-3" />
                            : trend === 'down'
                            ? <TrendingDown className="w-3 h-3" />
                            : <Minus className="w-3 h-3" />}
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

/** Handles tables with no headers — auto-detects first row as header if it looks like one */
function RawTable({ cutoff }: { cutoff: any }) {
  const rows: string[][] = cutoff.rows || []
  if (rows.length === 0) return null

  // If first row looks like a header row (all non-numeric strings)
  const firstRow = rows[0]
  const looksLikeHeader = firstRow.every(cell => isNaN(parseFloat(cell)))

  if (looksLikeHeader && rows.length > 1) {
    const syntheticCutoff = { ...cutoff, headers: firstRow, rows: rows.slice(1) }
    return syntheticCutoff.headers.length > 2
      ? <MultiColTable cutoff={syntheticCutoff} />
      : <SimpleTable cutoff={syntheticCutoff} />
  }

  const colCount = Math.max(...rows.map(r => r.length), 0)
  return colCount > 2
    ? <MultiColTable cutoff={{ ...cutoff, headers: Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`) }} />
    : <SimpleTable cutoff={{ ...cutoff, headers: ['Item', 'Value'] }} />
}

/** Wrapper card for each cutoff block */
function CutoffCard({ cutoff, index }: { cutoff: any; index: number }) {
  const title = getTitle(cutoff, index)
  const hasHeaders = cutoff.headers && cutoff.headers.length > 0
  const isMulti = isMultiColTable(cutoff)

  return (
    <div
      className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B]
                 hover:border-amber-500/40 hover:-translate-y-1"
      style={{ borderColor }}
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Card header */}
      <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                     group-hover:scale-110 transition-transform duration-500 shrink-0"
          style={{ borderColor, color: accentColor }}
        >
          <Target className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {isMulti ? 'Year-wise / Round-wise Comparison' : 'Admission Benchmark'}
          </p>
        </div>
        {/* Col count badge */}
        {hasHeaders && (
          <span
            className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ borderColor, color: accentColor }}
          >
            {cutoff.headers.length} cols
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="relative z-10 px-6 md:px-8 py-6">
        {!hasHeaders
          ? <RawTable cutoff={cutoff} />
          : isMulti
          ? <MultiColTable cutoff={cutoff} />
          : <SimpleTable cutoff={cutoff} />
        }
      </div>

      {/* Corner glow */}
      <div
        className="absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-0
                   group-hover:opacity-15 transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CutoffPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCollege() }, [slug])

  const fetchCollege = async () => {
    try {
      const { data } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()
      setCollege(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
      </div>
    )
  }

  const micrositeData =
    typeof college?.microsite_data === 'string'
      ? JSON.parse(college.microsite_data)
      : college?.microsite_data

  const cutoffData: any[] = micrositeData?.cutoff || college?.cutoff || []

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Entrance Benchmarks
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Admission <span style={{ color: accentColor }}>Thresholds.</span>
        </h1>
        {cutoffData.length > 0 && (
          <p className="text-slate-500 text-xs">
            {cutoffData.length} table{cutoffData.length > 1 ? 's' : ''} · All categories & years
          </p>
        )}
      </div>

      {cutoffData.length > 0 ? (
        <div className="space-y-8">
          {cutoffData.map((cutoff, index) => (
            <CutoffCard key={index} cutoff={cutoff} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">No Cutoff Data</h3>
          <p className="text-slate-500 text-xs mt-1">Processing recent examination results.</p>
        </div>
      )}
    </div>
  )
}