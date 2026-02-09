"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Award, Star } from "lucide-react"

const accentColor = '#F59E0B'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

export default function RankingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollege()
  }, [slug])

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
    
  const rankingData = micrositeData?.ranking || college?.ranking || []

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Excellence Benchmarks
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight flex items-center gap-3">
          Rankings & <span style={{ color: accentColor }}>Recognition.</span>
        </h1>
      </div>

      {rankingData.length > 0 ? (
        <div className="space-y-8">
          {rankingData.map((ranking: any, index: number) => (
            <div
              key={index}
              className="group relative p-6 md:p-8 rounded-[2.5rem] border transition-all duration-500 shadow-xl bg-[#0F172B] hover:border-amber-500/50 hover:-translate-y-1.5 overflow-hidden"
              style={{ borderColor: borderColor }}
            >
              {/* Dynamic Glow Overlay - Matching Courses */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-500/[0.02] to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Header: Agency Name & Year */}
              <div className="relative z-10 flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-[#050818] rounded-2xl flex items-center justify-center border border-white/5 shrink-0 transition-transform duration-500 group-hover:scale-110" 
                     style={{ borderColor: borderColor, color: accentColor }}>
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-none group-hover:text-amber-400 transition-colors duration-300">
                    {ranking.headers?.[0] || "Overall Ranking"}
                  </h3>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] mt-2 transition-colors group-hover:text-amber-500/60">
                    {ranking.headers?.[1] || "Latest Cycle"}
                  </p>
                </div>
              </div>

              {/* Data Rows - Intensified Hover to Match Courses */}
              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-4">
                {ranking.rows?.map((row: any[], i: number) => (
                  <div
                    key={i}
                    className="group/row flex justify-between items-center p-5 rounded-2xl bg-[#050818]/60 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/[0.08] transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/30 group-hover/row:bg-amber-500 transition-colors shadow-[0_0_8px_rgba(245,158,11,0)] group-hover/row:shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-slate-300 font-bold text-xs uppercase tracking-tight group-hover/row:text-white transition-colors">
                        {row[0]}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-white font-black text-2xl tracking-tighter transition-all duration-300 group-hover/row:text-amber-400 group-hover/row:scale-110 origin-right">
                          #{row[1]}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest group-hover/row:text-amber-500/60 transition-colors">
                        Rank
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Corner Glow */}
              <div 
                className="absolute -right-12 -bottom-12 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700" 
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
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