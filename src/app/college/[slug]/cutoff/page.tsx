"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { BarChart3, Loader2, TrendingUp, Target, ChevronRight } from "lucide-react"

// Consistent Color Palette
const accentColor = '#F59E0B';
const primaryBg = '#050818'; 
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

  // Safe data extraction
  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const cutoffData = micrositeData?.cutoff || college?.cutoff || []

  return (
    <div className="min-h-screen p-6 sm:p-12" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Header Section */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12" style={{ backgroundColor: accentColor }}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accentColor }}>
              Entrance Benchmarks
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Admission <br />
            <span style={{ color: accentColor }}>Thresholds.</span>
          </h1>
        </div>

        {cutoffData.length > 0 ? (
          <div className="space-y-16">
            {cutoffData.map((cutoff: any, index: number) => (
              <div
                key={index}
                className="group relative p-8 sm:p-12 rounded-[3.5rem] border transition-all duration-500 shadow-2xl overflow-hidden"
                style={{ backgroundColor: secondaryBg, borderColor: borderColor }}
              >
                {/* Visual Background Element */}
                <div className="absolute -left-20 -top-20 w-64 h-64 blur-[100px] rounded-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: accentColor }}></div>

                {/* Table Title / Headers */}
                {cutoff.headers && cutoff.headers.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: primaryBg, borderColor: borderColor }}>
                         <Target className="w-6 h-6" style={{ color: accentColor }} />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                          {cutoff.headers[0]}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Competitive Analysis</p>
                      </div>
                    </div>
                    {cutoff.headers[1] && (
                      <div className="px-6 py-2 rounded-full border border-white/5 bg-white/5">
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-tighter">
                          {cutoff.headers[1]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rows Grid */}
                {cutoff.rows && cutoff.rows.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cutoff.rows.map((row: any[], rowIndex: number) => (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 group/row hover:bg-amber-400/5 hover:translate-x-1"
                        style={{ backgroundColor: primaryBg, borderColor: 'rgba(255,255,255,0.02)' }}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover/row:opacity-100 transition-opacity" style={{ color: accentColor }} />
                          <span className="text-slate-400 font-bold text-sm uppercase tracking-wide group-hover/row:text-slate-200">
                            {row[0]}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-white font-black text-xl group-hover/row:scale-105 transition-transform">
                            {row[1]}
                          </span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Closing Score</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-[4rem] border-2 border-dashed" style={{ borderColor: borderColor, backgroundColor: secondaryBg }}>
            <BarChart3 className="w-16 h-16 mx-auto mb-6 opacity-10" style={{ color: accentColor }} />
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">
              Analyzing Data
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Current year cutoff trends are being processed based on recent examination results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}