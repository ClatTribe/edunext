"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { TrendingUp, Trophy, Loader2, Briefcase, Award } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function PlacementPage() {
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

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const placementStats = micrositeData?.placement_stats
  const recruiters = placementStats?.recruiters || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: accentColor }} />
            Placements
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.6em]">
            Career Success Stories
          </p>
        </div>

        {placementStats ? (
          <div className="space-y-16">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-10 sm:p-12 rounded-[4rem] bg-white/5 border border-white/10 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 transition-all text-center space-y-6">
                <Award className="w-16 h-16 mx-auto" style={{ color: accentColor }} />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">
                    Highest Package
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    {placementStats.highest}
                  </p>
                </div>
              </div>

              <div className="p-10 sm:p-12 rounded-[4rem] bg-white/5 border border-white/10 hover:bg-blue-600/5 hover:border-blue-500/30 transition-all text-center space-y-6">
                <Briefcase className="w-16 h-16 mx-auto text-blue-500" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">
                    Average Package
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    {placementStats.average}
                  </p>
                </div>
              </div>

              <div className="p-10 sm:p-12 rounded-[4rem] bg-white/5 border border-white/10 hover:bg-purple-600/5 hover:border-purple-500/30 transition-all text-center space-y-6">
                <Trophy className="w-16 h-16 mx-auto text-purple-500" />
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">
                    Top Recruiters
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    {recruiters.length}+
                  </p>
                </div>
              </div>
            </div>

            {/* Recruiters Section */}
            {recruiters.length > 0 && (
              <div className="space-y-12">
                <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter text-center">
                  Top <span style={{ color: accentColor }}>Recruiters</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recruiters.map((recruiter: string, i: number) => (
                    <div 
                      key={i}
                      className="p-8 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 transition-all text-center"
                    >
                      <p className="text-white font-black text-sm">{recruiter}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[4rem] p-12 sm:p-16 backdrop-blur-xl text-center bg-white/5 border border-white/10">
            <Trophy className="w-16 h-16 mx-auto text-slate-600 mb-6" />
            <h3 className="text-xl sm:text-2xl font-black text-white mb-4">
              Placement Data Coming Soon
            </h3>
            <p className="text-slate-400 font-medium">
              We're working on adding detailed placement statistics for this college.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}