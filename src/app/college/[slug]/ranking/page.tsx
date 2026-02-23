"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Award, Star } from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTitle(table: any, index: number): string {
  if (table?.heading && table.heading.trim() !== '') return table.heading.trim()
  return `Ranking Table ${index + 1}`
}

function cleanCell(val: string): string {
  return val?.toString().replace(/Compare$/i, '').trim() || '—'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SimpleTable({ table }: { table: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {table.rows.map((row: string[], i: number) => (
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
              #{cleanCell(row[1])}
            </span>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
              {table.headers?.[1] || 'Rank'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MultiColTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: string[][] = table.rows || []

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
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/[0.04] hover:bg-amber-500/[0.04] transition-colors group/tr">
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
                  {cleanCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RawTable({ table }: { table: any }) {
  const rows: string[][] = table.rows || []
  if (rows.length === 0) return null
  const firstRow = rows[0]
  const looksLikeHeader = firstRow.every(cell => isNaN(parseFloat(cell)))
  if (looksLikeHeader && rows.length > 1) {
    const synthetic = { ...table, headers: firstRow, rows: rows.slice(1) }
    return synthetic.headers.length > 2 ? <MultiColTable table={synthetic} /> : <SimpleTable table={synthetic} />
  }
  const colCount = Math.max(...rows.map(r => r.length), 0)
  return colCount > 2
    ? <MultiColTable table={{ ...table, headers: Array.from({ length: colCount }, (_, i) => `Col ${i + 1}`) }} />
    : <SimpleTable table={{ ...table, headers: ['Item', 'Value'] }} />
}

function RankingCard({ table, index }: { table: any; index: number }) {
  const title = getTitle(table, index)
  const hasHeaders = table.headers && table.headers.length > 0
  const isMulti = hasHeaders && table.headers.length > 2

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
          <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Excellence Benchmark
          </p>
        </div>
        {hasHeaders && (
          <span
            className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ borderColor, color: accentColor }}
          >
            {table.headers.length} cols
          </span>
        )}
      </div>

      <div className="relative z-10 px-6 md:px-8 py-6">
        {!hasHeaders
          ? <RawTable table={table} />
          : isMulti
          ? <MultiColTable table={table} />
          : <SimpleTable table={table} />
        }
      </div>

      <div
        className="absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-0
                   group-hover:opacity-15 transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RankingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCollege() }, [slug])

  const fetchCollege = async () => {
    try {
      const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).single()
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

  const micrositeData = typeof college?.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : college?.microsite_data

  const rankingData: any[] = micrositeData?.ranking || college?.ranking || []

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Excellence Benchmarks
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-3">
          Rankings & <span style={{ color: accentColor }}>Recognition.</span>
        </h1>
        {rankingData.length > 0 && (
          <p className="text-slate-500 text-xs">
            {rankingData.length} table{rankingData.length > 1 ? 's' : ''} · All ranking bodies & years
          </p>
        )}
      </div>

      {rankingData.length > 0 ? (
        <div className="space-y-8">
          {rankingData.map((table, index) => (
            <RankingCard key={index} table={table} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01]">
          <Star className="w-12 h-12 mx-auto text-slate-800 mb-4 opacity-20" />
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Ranking data being verified</p>
        </div>
      )}
    </div>
  )
}