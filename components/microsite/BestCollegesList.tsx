"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Star, ChevronRight, Trophy } from "lucide-react"

export type BestCollegeItem = {
  slug: string
  college_name: string
  location: string | null
  rating: number | null
  review_count: number | null
  rankLabel: string | null
}

const borderColor = "rgba(245, 158, 11, 0.15)"
const PAGE = 25

export default function BestCollegesList({ colleges }: { colleges: BestCollegeItem[] }) {
  const [shown, setShown] = useState(PAGE)
  const visible = colleges.slice(0, shown)
  const remaining = colleges.length - shown

  return (
    <>
      <ol className="space-y-3">
        {visible.map((c, i) => (
          <li key={c.slug}>
            <Link
              href={`/college/${c.slug}`}
              className="group relative flex items-center gap-4 rounded-2xl border bg-[#0F172B] p-4 transition-all duration-300 hover:border-amber-500/40"
              style={{ borderColor }}
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
                </div>
              </div>

              <span className="hidden sm:flex items-center gap-1 self-center whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-amber-400">
                View details <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </li>
        ))}
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
