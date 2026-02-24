"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { IndianRupee, Loader2, Wallet, BarChart3 } from "lucide-react"

const accentColor = '#F59E0B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanCell(val: any): string {
  if (val === null || val === undefined) return '—'
  return val.toString().replace(/Compare$/i, '').trim() || '—'
}

// ─── Unified Table Component (Matches Cutoff Style) ─────────────────────────

function ProperTable({ table }: { table: any }) {
  const headers: string[] = table.headers || []
  const rows: any[][] = table.rows || []

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050818]/40">
      <table className="w-full text-sm border-collapse min-w-[500px]">
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
          {rows.map((row, ri) => (
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
                    <span>{cleanCell(cell)}</span>
                  </td>
                ))
              ) : (
                <td colSpan={headers.length} className="px-6 py-4 text-slate-500 italic">
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

/** Auto-detect and normalize tables */
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
    const synthetic = Array.from({ length: colCount }, (_, i) => i === 0 ? 'Course/Item' : `Value ${i}`)
    return <ProperTable table={{ ...table, headers: synthetic }} />
  }

  return <ProperTable table={table} />
}

// ─── Wrapper Card ───────────────────────────────────────────────────────────

function FeeCard({ table }: { table: any }) {
  // Only show title if it exists in DB, no fallbacks
  const title = table.heading?.trim() || null

  return (
    <div
      className="group relative rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B]
                 hover:border-amber-500/40 hover:-translate-y-1"
      style={{ borderColor }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Heading Section: Only renders if title is not null */}
      {title && (
        <div className="relative z-10 flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]
                       group-hover:scale-110 transition-transform duration-500 shrink-0"
            style={{ borderColor, color: accentColor }}
          >
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Institutional Fees
            </p>
          </div>
        </div>
      )}

      {/* Table Section: Adjusts padding based on whether heading exists */}
      <div className={`relative z-10 px-6 md:px-8 ${title ? 'py-8' : 'pt-6 pb-8'}`}>
        <AutoTable table={table} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FeesPage() {
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

  const feesData: any[] = micrositeData?.fees || college?.fees || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[1.5px] w-8 bg-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500">Finance Portal</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Fee <span className="text-amber-500">Structure.</span>
        </h1>
      </div>

      <div className="space-y-10">
        {feesData.length > 0 ? (
          feesData.map((table, index) => <FeeCard key={index} table={table} />)
        ) : (
          <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10 text-amber-500" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fee structure is being updated</p>
          </div>
        )}
      </div>
    </div>
  )
}