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
      {/* Header Section - Scale adjusted for Sidebar Layout */}
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
        /* Grid Logic:
          - Mobile: 1 column (List style)
          - Tablet: 2 columns (Before sidebar appears)
          - Desktop (lg): 1 column (Due to sidebar taking space)
          - Wide (xl): 2 columns
        */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-[2rem] border transition-all duration-300 hover:border-amber-500/40 overflow-hidden shadow-xl flex flex-col"
              style={{ 
                backgroundColor: secondaryBg,
                borderColor: borderColor
              }}
            >
              {/* Icon & Title Area */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border bg-[#050818]" 
                  style={{ 
                    borderColor: borderColor,
                    color: accentColor 
                  }}>
                  <Wallet size={20} />
                </div>
                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                  {course.course}
                </h3>
              </div>
              
              {/* Fee Display Box */}
              <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:bg-amber-500/[0.03] transition-colors">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Total Course Fee
                </p>
                <p className="text-2xl font-black text-white flex items-center gap-1">
                  <span className="text-xs text-amber-500">₹</span>
                  {course.fees}
                </p>
              </div>

              {/* Info Details */}
              <div className="space-y-3 mt-auto">
                {course.eligibility && course.eligibility !== '-' && (
                  <div className="flex items-start gap-2 px-1">
                    <Info className="w-3.5 h-3.5 mt-0.5 text-amber-500/50" />
                    <div>
                      <p className="text-[11px] text-slate-400 leading-tight">{course.eligibility}</p>
                    </div>
                  </div>
                )}

                {course.hostelFees && (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[10px] text-slate-300 font-medium">Hostel: {course.hostelFees}</p>
                  </div>
                )}
              </div>

              {/* Corner Decor */}
              <div className="absolute -right-6 -bottom-6 w-16 h-16 blur-2xl rounded-full opacity-5 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: accentColor }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <IndianRupee className="w-12 h-12 mx-auto mb-4 opacity-10" style={{ color: accentColor }} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fee structure is being updated</p>
        </div>
      )}
    </div>
  )
}