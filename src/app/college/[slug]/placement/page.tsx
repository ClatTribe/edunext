"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { TrendingUp, Trophy, Loader2, Briefcase, Award, BarChart3, Building2 } from "lucide-react"

// Unified Color Palette
const accentColor = '#F59E0B';
const primaryBg = '#050818'; 
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

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

  const placementData = micrositeData?.placement || []
  const mainPlacementTable = placementData[0] || { headers: [], rows: [] }
  const highestPackage = mainPlacementTable.headers?.[1] || 'N/A'
  const averagePackage = mainPlacementTable.rows?.[0]?.[1] || 'N/A'
  const topRecruitersString = mainPlacementTable.rows?.[1]?.[1] || '' 
  
  const recruitersFromTable = (placementData[1]?.rows || []).flat().filter(Boolean)
  const companiesFromTable = (placementData[2]?.rows || []).flat().filter(Boolean)
  
  const uniqueRecruiters = [...new Set([
    ...topRecruitersString.split(',').map((r: string) => r.trim()).filter(Boolean),
    ...recruitersFromTable,
    ...companiesFromTable
  ])]

  const hasPlacementData = highestPackage !== 'N/A' || averagePackage !== 'N/A' || uniqueRecruiters.length > 0

  return (
    <div className="min-h-screen p-6 sm:p-12" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12" style={{ backgroundColor: accentColor }}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accentColor }}>
              Career Outcomes
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Placement <br />
            <span style={{ color: accentColor }}>Metrics.</span>
          </h1>
        </div>

        {hasPlacementData ? (
          <div className="space-y-32">
            {/* Stats Cards - Grid Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Highest Package', val: highestPackage, icon: Award, color: accentColor },
                { label: 'Average Package', val: averagePackage, icon: BarChart3, color: '#3B82F6' },
                { label: 'Total Recruiters', val: `${uniqueRecruiters.length}+`, icon: Building2, color: '#A855F7' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="group relative p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl"
                  style={{ backgroundColor: secondaryBg, borderColor: borderColor }}
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 blur-[60px] opacity-10 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: primaryBg, borderColor: 'rgba(255,255,255,0.05)', color: stat.color }}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-white group-hover:text-white transition-colors">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Recruiters Pill Grid */}
            {uniqueRecruiters.length > 0 && (
              <div className="space-y-16">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-[2px]" style={{ backgroundColor: accentColor }}></div>
                  <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                    Industry <span style={{ color: accentColor }}>Partners.</span>
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase">
                    Leading companies hiring from our campus
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {uniqueRecruiters.map((recruiter: string, i: number) => (
                    <div 
                      key={i}
                      className="group p-6 rounded-2xl border transition-all duration-300 hover:bg-white/5 flex items-center justify-center text-center"
                      style={{ backgroundColor: secondaryBg, borderColor: 'rgba(255,255,255,0.03)' }}
                    >
                      <p className="text-slate-300 font-bold text-xs uppercase tracking-wider group-hover:text-white transition-colors">
                        {recruiter}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-32 rounded-[4rem] border-2 border-dashed" 
               style={{ borderColor: borderColor, backgroundColor: secondaryBg }}>
            <Trophy className="w-16 h-16 mx-auto mb-6 opacity-10" style={{ color: accentColor }} />
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">
              Data Synchronizing
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              We are currently verified latest placement statistics for the 2024-25 cycle.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}