"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { IndianRupee, Loader2 } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

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

  const popularCourses = micrositeData?.popular_courses_table || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-4">
            <IndianRupee className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: accentColor }} />
            Fee Structure
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.6em]">
            Investment in Excellence
          </p>
        </div>

        {popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {popularCourses.map((course: any, index: number) => (
              <div
                key={index}
                className="p-8 sm:p-10 rounded-[4rem] backdrop-blur-xl hover:shadow-2xl transition-all bg-white/5 border border-white/10 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 space-y-6"
              >
                <div className="w-16 h-16 bg-[#060818] rounded-[2rem] flex items-center justify-center border border-white/10 mb-6" style={{ color: accentColor }}>
                  <IndianRupee className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {course.course_name}
                </h3>
                
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">
                      Total Fees
                    </p>
                    <p className="text-2xl sm:text-3xl font-black" style={{ color: accentColor }}>
                      {course.fees}
                    </p>
                  </div>

                  {course.eligibility && course.eligibility !== '-' && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-1">
                        Eligibility
                      </p>
                      <p className="text-sm text-slate-300 font-semibold">
                        {course.eligibility}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-[4rem] bg-white/5 border border-white/10">
            <IndianRupee className="w-16 h-16 mx-auto text-slate-600 mb-6" />
            <p className="text-slate-400 font-semibold text-lg">Fee information not available</p>
          </div>
        )}
      </div>
    </div>
  )
}