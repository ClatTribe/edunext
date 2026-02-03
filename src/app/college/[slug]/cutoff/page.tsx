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
              className="group relative p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-xl overflow-hidden bg-[#0F172B]"
              style={{ borderColor: borderColor }}
            >
              {/* Table Header Area */}
              {cutoff.headers && cutoff.headers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#050818]" style={{ borderColor: borderColor }}>
                       <Target size={18} style={{ color: accentColor }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase">
                        {cutoff.headers[0]}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score Analysis</p>
                    </div>
                  </div>
                  {cutoff.headers[1] && (
                    <div className="px-4 py-1.5 rounded-lg border border-white/5 bg-white/5 self-start sm:self-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">
                        {cutoff.headers[1]}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Rows Grid: Smart logic for Sidebar */}
              {cutoff.rows && cutoff.rows.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {cutoff.rows.map((row: any[], rowIndex: number) => (
                    <div
                      key={rowIndex}
                      className="flex items-center justify-between p-4 rounded-xl border bg-[#050818]/40 border-white/5 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex items-center gap-2 max-w-[70%]">
                        <ChevronRight size={14} className="text-amber-500 shrink-0" />
                        <span className="text-slate-300 font-medium text-xs uppercase tracking-tight truncate">
                          {row[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-lg block">
                          {row[1]}
                        </span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Closing</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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