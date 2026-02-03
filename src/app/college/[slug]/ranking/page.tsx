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

  // Safe parsing for nested data
  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data
    
  const rankingData = micrositeData?.ranking || college?.ranking || []

  return (
    <div className="space-y-10">
      {/* Header Section - Left aligned for better sidebar flow */}
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
              className="p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-xl bg-[#0F172B]"
              style={{ borderColor: borderColor }}
            >
              {/* Header: Agency Name & Year */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-[#050818] rounded-2xl flex items-center justify-center border border-white/5 shrink-0" style={{ color: accentColor }}>
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-none">
                    {ranking.headers?.[0] || "Overall Ranking"}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                    {ranking.headers?.[1] || "Latest Cycle"}
                  </p>
                </div>
              </div>

              {/* Data Rows: Single Column for Sidebar/Mobile, 2 columns on Wide Screens */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {ranking.rows?.map((row: any[], i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 rounded-xl bg-[#050818]/50 border border-white/5 hover:border-amber-500/20 transition-all group"
                  >
                    <span className="text-slate-400 font-bold text-xs group-hover:text-slate-200 transition-colors">
                      {row[0]}
                    </span>
                    <div className="flex flex-col items-end">
                       <span className="text-white font-black text-lg" style={{ color: accentColor }}>
                        #{row[1]}
                      </span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase">Rank</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <Star className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Ranking data being verified</p>
        </div>
      )}
    </div>
  )
}