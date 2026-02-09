"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { BarChart3, Loader2, Target, ChevronRight } from "lucide-react"

const accentColor = '#F59E0B';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

export default function CutoffPage() {
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

  const cutoffData = micrositeData?.cutoff || college?.cutoff || []

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Entrance Benchmarks
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Admission <span style={{ color: accentColor }}>Thresholds.</span>
        </h1>
      </div>

      {cutoffData.length > 0 ? (
        <div className="space-y-10">
          {cutoffData.map((cutoff: any, index: number) => (
            <div
              key={index}
              className="group relative p-6 md:p-8 rounded-[2rem] border transition-all duration-500 shadow-xl overflow-hidden bg-[#0F172B] hover:border-amber-500/50 hover:-translate-y-1.5"
              style={{ borderColor: borderColor }}
            >
              {/* Dynamic Glow Overlay - Same as Courses */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Table Header Area */}
              {cutoff.headers && cutoff.headers.length > 0 && (
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#050818] transition-all duration-500 group-hover:scale-110" 
                         style={{ borderColor: borderColor, color: accentColor }}>
                       <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase group-hover:text-amber-400 transition-colors">
                        {cutoff.headers[0]}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Competitive Analysis</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rows Grid - Enhanced Hover to Match Courses */}
              {cutoff.rows && cutoff.rows.length > 0 && (
                <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {cutoff.rows.map((row: any[], rowIndex: number) => (
                    <div
                      key={rowIndex}
                      className="group/row flex items-center justify-between p-5 rounded-2xl border bg-[#050818]/60 border-white/5 hover:border-amber-500/40 hover:bg-amber-500/[0.08] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 max-w-[70%]">
                        <div className="w-2 h-2 rounded-full bg-amber-500/20 group-hover/row:bg-amber-500 transition-colors" />
                        <span className="text-slate-300 font-bold text-xs uppercase tracking-tight truncate group-hover/row:text-white transition-colors">
                          {row[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-xl block tracking-tighter group-hover/row:text-amber-400 transition-colors">
                          {row[1]}
                        </span>
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest group-hover/row:text-amber-500/60 transition-colors">
                          Closing Score
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Decorative Corner Glow - Same as Courses */}
              <div 
                className="absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700" 
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Processing Data</h3>
          <p className="text-slate-500 text-xs mt-1">Processing recent examination results.</p>
        </div>
      )}
    </div>
  )
}