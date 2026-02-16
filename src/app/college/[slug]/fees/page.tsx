"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { IndianRupee, Loader2, Wallet, Info } from "lucide-react"

const accentColor = '#F59E0B';
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

interface CourseFee {
  course: string
  eligibility: string
  fees: string
  hostelFees?: string
}

export default function FeesPage() {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
      </div>
    )
  }

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const feesData = micrositeData?.fees?.[0] || { headers: [], rows: [] }
  const rows = feesData.rows || []

  const courses: CourseFee[] = rows.map((row: any[]) => ({
    course: row[0] || 'N/A',
    eligibility: row[1] || 'N/A',
    fees: row[2] || 'N/A',
    hostelFees: row[3] || undefined
  }))

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Financial Breakdown
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Fee <span style={{ color: accentColor }}>Structure.</span>
        </h1>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group relative p-7 rounded-[2.5rem] border transition-all duration-500 hover:border-amber-500/40 overflow-hidden shadow-2xl flex flex-col hover:-translate-y-2"
              style={{ 
                backgroundColor: secondaryBg,
                borderColor: borderColor
              }}
            >
              {/* Animated Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] via-transparent to-amber-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon & Title Area */}
              <div className="relative z-10 flex items-start gap-5 mb-6">
                <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border bg-[#050818] transition-transform duration-500 group-hover:scale-110" 
                  style={{ 
                    borderColor: borderColor,
                    color: accentColor 
                  }}>
                  <Wallet size={24} />
                </div>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-amber-400 transition-colors duration-300">
                  {course.course}
                </h3>
              </div>
              
              {/* Fee Display Box */}
              <div className="relative z-10 mb-6 p-5 rounded-[1.5rem] bg-black/40 border border-white/5 group-hover:bg-amber-500/[0.05] group-hover:border-amber-500/10 transition-all duration-500">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 group-hover:text-amber-500/50 transition-colors">
                  Total Course Fee
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-amber-500">₹</span>
                  <p className="text-3xl font-black text-white tracking-tight">
                    {course.fees}
                  </p>
                </div>
              </div>

              {/* Info Details */}
              <div className="relative z-10 space-y-4 mt-auto">
                {course.eligibility && course.eligibility !== '-' && (
                  <div className="flex items-start gap-3 px-1">
                    <Info className="w-4 h-4 mt-0.5 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                    <p className="text-[12px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      {course.eligibility}
                    </p>
                  </div>
                )}

                {course.hostelFees && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-amber-500/20 group-hover:bg-amber-500/[0.02] transition-all">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <p className="text-[11px] text-slate-300 font-semibold tracking-wide uppercase">
                      Hostel: <span className="text-white ml-1 font-black italic">{course.hostelFees}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Decorative Corner Glow */}
              <div 
                className="absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-5 group-hover:opacity-20 transition-all duration-700" 
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <IndianRupee className="w-8 h-8 opacity-20" style={{ color: accentColor }} />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Fee structure is being updated</p>
        </div>
      )}
    </div>
  )
}