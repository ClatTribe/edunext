"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { MapPin, Star, ChevronRight, Trophy } from "lucide-react"

export type BestCollegeItem = {
  slug: string
  college_name: string
  location: string | null
  rating: number | null
  review_count: number | null
  rankLabel: string | null
  avg_package?: string | null
  fees?: string | null
}

const borderColor = "rgba(245, 158, 11, 0.15)"
const PAGE = 25

export default function BestCollegesList({ colleges }: { colleges: BestCollegeItem[] }) {
  const [shown, setShown] = useState(PAGE)

  const [roiBudget, setRoiBudget] = useState<number | null>(null)
  const [predScore, setPredScore] = useState<number | null>(null)

  useEffect(() => {
    const handleRoi = (e: any) => setRoiBudget(e.detail.maxBudgetLpa)
    const handlePred = (e: any) => setPredScore(e.detail.score)
    window.addEventListener('edunext_roi_updated', handleRoi)
    window.addEventListener('edunext_prediction_updated', handlePred)
    return () => {
      window.removeEventListener('edunext_roi_updated', handleRoi)
      window.removeEventListener('edunext_prediction_updated', handlePred)
    }
  }, [])

  // 1. Sort colleges by ROI budget to bring matches to the top
  const sortedColleges = useMemo(() => {
    if (roiBudget === null) return colleges

    return [...colleges].sort((a, b) => {
      const getFee = (c: BestCollegeItem) => {
        const match = c.fees ? c.fees.match(/\d+(\.\d+)?/) : null
        return match ? parseFloat(match[0]) : 0
      }
      
      const feeA = getFee(a)
      const feeB = getFee(b)
      
      const getCat = (fee: number) => {
        if (fee > 0 && fee <= roiBudget) return 1 // Exact Match (Top)
        if (fee > roiBudget) return 2 // Out of Range (Middle)
        return 3 // No Data (Bottom)
      }

      const catA = getCat(feeA)
      const catB = getCat(feeB)
      
      if (catA !== catB) {
        return catA - catB // Lower category number bubbles to top
      }
      
      return 0 // Keep original NIRF/EduNext ranking order otherwise
    })
  }, [colleges, roiBudget])

  // Reset pagination when filter changes
  useEffect(() => {
    setShown(PAGE)
  }, [roiBudget, predScore])

  const visible = sortedColleges.slice(0, shown)
  const remaining = sortedColleges.length - shown

  return (
    <>
      <ol className="space-y-3">
        {visible.map((c, i) => {
          // Parse Placement
          const lpaVal = c.avg_package ? parseFloat(c.avg_package.replace(/[^0-9.]/g, '') || "0") : 0
          
          // Parse Fees
          const feeMatch = c.fees ? c.fees.match(/\d+(\.\d+)?/) : null
          const minFeeLpa = feeMatch ? parseFloat(feeMatch[0]) : 0
          
          let cardBorder = borderColor
          let shadow = ""
          let roiBadge = null

          if (roiBudget !== null && minFeeLpa > 0) {
            if (minFeeLpa <= roiBudget) {
               cardBorder = "rgba(16, 185, 129, 0.9)" // Solid Green
               shadow = "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
               roiBadge = <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-500">✅ Exact Match</span>
            } else {
               cardBorder = "rgba(239, 68, 68, 0.9)" // Solid Red
               shadow = "shadow-[0_0_15px_rgba(239,68,68,0.2)]"
               roiBadge = <span className="inline-flex items-center gap-1 rounded-md border border-red-500 bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-red-500">Out of Range: Fees ({minFeeLpa}L) &gt; Budget ({roiBudget}L)</span>
            }
          }

          const isPredMatch = predScore !== null && (i < 5) // Fake Predictor logic: top 5 are high chance for demo
          if (isPredMatch && roiBudget === null) {
            cardBorder = "rgba(59, 130, 246, 0.5)" // Blueish
            shadow = "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          }

          return (
          <li key={c.slug}>
            <Link
              href={`/college/${c.slug}`}
              className={`group relative flex items-center gap-4 rounded-2xl border bg-[#0F172B] p-4 transition-all duration-300 hover:border-amber-500/40 ${shadow}`}
              style={{ borderColor: cardBorder }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-[#050818] text-sm font-black text-amber-500">
                {i + 1}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {c.college_name}
                </h3>
                {c.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={11} /> {c.location}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {c.rankLabel && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                      <Trophy size={11} /> {c.rankLabel}
                    </span>
                  )}
                  {c.rating ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                      <Star size={11} /> {c.rating}{c.review_count ? ` (${c.review_count})` : ""}
                    </span>
                  ) : null}
                  {minFeeLpa > 0 && (
                     <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                       Fees: ~{minFeeLpa}L
                     </span>
                  )}
                  {c.avg_package && (
                     <span className="inline-flex items-center gap-1 rounded-md border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                       Placement: {c.avg_package}
                     </span>
                  )}
                  {roiBadge}
                  {isPredMatch && (
                     <span className="inline-flex items-center gap-1 rounded-md border border-blue-500 bg-blue-500 px-2 py-0.5 text-[10px] font-black uppercase text-[#050818]">
                       High Chance
                     </span>
                  )}
                </div>
              </div>

              <span className="hidden sm:flex items-center gap-1 self-center whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-amber-400">
                View details <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </li>
        )})}
      </ol>

      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShown((s) => s + PAGE)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500/10 hover:border-amber-500/50"
          >
            Show more colleges ({remaining} left)
          </button>
        </div>
      )}
    </>
  )
}
