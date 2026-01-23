"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { IndianRupee, Loader2, Wallet, Info } from "lucide-react"

// Consistent Color Palette
const accentColor = '#F59E0B';
const primaryBg = '#050818'; 
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: primaryBg }}>
        <Loader2 className="animate-spin h-12 w-12" style={{ color: accentColor }} />
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
    <div className="min-h-screen p-6 sm:p-12" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12" style={{ backgroundColor: accentColor }}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accentColor }}>
              Financial Breakdown
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Fee <br />
            <span style={{ color: accentColor }}>Structure.</span>
          </h1>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl flex flex-col justify-between"
                style={{ 
                  backgroundColor: secondaryBg,
                  borderColor: borderColor
                }}
              >
                {/* Visual Accent */}
                <div className="absolute -right-12 -top-12 w-32 h-32 blur-[80px] rounded-full opacity-10 transition-opacity group-hover:opacity-30" style={{ backgroundColor: accentColor }}></div>

                <div>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:bg-amber-400 group-hover:text-black" 
                    style={{ 
                      backgroundColor: primaryBg, 
                      borderColor: borderColor,
                      color: accentColor 
                    }}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  
                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-white mb-6 leading-tight group-hover:text-amber-400 transition-colors">
                    {course.course}
                  </h3>
                  
                  {/* Details List */}
                  <div className="space-y-5">
                    {/* Main Fee */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-amber-400/20 transition-colors">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                        Total Course Fee
                      </p>
                      <p className="text-2xl font-black text-white flex items-center gap-1">
                        <span className="text-sm" style={{ color: accentColor }}>₹</span>
                        {course.fees}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="px-1 space-y-4">
                      {course.eligibility && course.eligibility !== '-' && (
                        <div className="flex items-start gap-3">
                          <Info className="w-4 h-4 mt-0.5 opacity-40 text-white" />
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Eligibility</p>
                            <p className="text-xs text-slate-300 font-medium">{course.eligibility}</p>
                          </div>
                        </div>
                      )}

                      {course.hostelFees && (
                        <div className="flex items-start gap-3">
                          <div className="w-4 h-4 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Accommodation</p>
                            <p className="text-xs text-slate-300 font-medium">{course.hostelFees}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Link Decor */}
                <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" style={{ color: accentColor }}>
                     Full Details →
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-[3rem] border-2 border-dashed" style={{ borderColor: borderColor, backgroundColor: secondaryBg }}>
            <IndianRupee className="w-16 h-16 mx-auto mb-6 opacity-20" style={{ color: accentColor }} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Fee structure data is currently being updated</p>
          </div>
        )}
      </div>
    </div>
  )
}