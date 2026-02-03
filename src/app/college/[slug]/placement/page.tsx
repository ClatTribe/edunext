"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Loader2, Award, BarChart3, Building2 } from "lucide-react"

const accentColor = '#F59E0B';
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
    <div className="space-y-12">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Career Outcomes
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Placement <span style={{ color: accentColor }}>Metrics.</span>
        </h1>
      </div>

      {hasPlacementData ? (
        <div className="space-y-16">
          {/* Stats Cards: Responsive Grid for Sidebar Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              { label: 'Highest Package', val: highestPackage, icon: Award, color: accentColor },
              { label: 'Average Package', val: averagePackage, icon: BarChart3, color: '#3B82F6' },
              { label: 'Total Recruiters', val: `${uniqueRecruiters.length}+`, icon: Building2, color: '#A855F7' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="group relative p-6 rounded-[1.5rem] border transition-all duration-300 bg-[#0F172B]"
                style={{ borderColor: borderColor }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#050818]" 
                    style={{ borderColor: 'rgba(255,255,255,0.05)', color: stat.color }}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.val}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Industry Partners Section */}
          {uniqueRecruiters.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">
                  Industry <span style={{ color: accentColor }}>Partners.</span>
                </h3>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              
              {/* Flexible Recruiter Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {uniqueRecruiters.map((recruiter: string, i: number) => (
                  <div 
                    key={i}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-center hover:bg-white/5 transition-colors"
                  >
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wide truncate">
                      {recruiter}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Updating Stats</h3>
          <p className="text-slate-500 text-xs mt-1">Verifying latest 2024-25 placement data.</p>
        </div>
      )}
    </div>
  )
}