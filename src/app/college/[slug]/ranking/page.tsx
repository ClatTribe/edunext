"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Award, Star } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-12 w-12" style={{ color: accentColor }} />
      </div>
    )
  }

  // Fix: Access ranking from microsite_data
  const rankingData = college?.microsite_data?.ranking || college?.ranking || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: accentColor }} />
            Rankings & Recognition
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.6em]">
            Excellence Benchmarks
          </p>
        </div>

        {rankingData.length > 0 ? (
          <div className="space-y-12">
            {rankingData.map((ranking: any, index: number) => (
              <div
                key={index}
                className="p-10 sm:p-16 rounded-[5rem] bg-white/5 border border-white/10 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 transition-all shadow-2xl"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-[#060818] rounded-3xl flex items-center justify-center border border-white/10" style={{ color: accentColor }}>
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {ranking.headers?.[0] || "Overall Ranking"}
                    </h3>
                    <p className="text-slate-400 text-sm font-semibold mt-1">
                      {ranking.headers?.[1] || "2024 Rankings"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {ranking.rows?.map((row: any[], i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-6 rounded-3xl bg-[#060818] border border-white/5"
                    >
                      <span className="text-slate-400 font-bold">{row[0]}</span>
                      <span className="text-white font-black text-xl" style={{ color: accentColor }}>
                        {row[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-[4rem] bg-white/5 border border-white/10">
            <Star className="w-16 h-16 mx-auto text-slate-600 mb-6" />
            <p className="text-slate-400 font-semibold text-lg">Ranking information not available</p>
          </div>
        )}
      </div>
    </div>
  )
}