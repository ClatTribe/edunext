"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { GraduationCap, Loader2, AlertCircle, ArrowRight } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#060818'

export default function CoursesPage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [college, setCollege] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCollege()
  }, [slug])

  const fetchCollege = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from("college_microsites")
        .select("*")
        .eq("slug", slug)
        .single()

      if (supabaseError) throw supabaseError
      setCollege(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses")
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

  if (error || !college) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <AlertCircle style={{ color: '#ef4444' }} size={20} />
            <p className="text-red-300">{error || "Failed to load courses"}</p>
          </div>
        </div>
      </div>
    )
  }

  const micrositeData = typeof college.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college.microsite_data

  const popularCourses = micrositeData?.popular_courses_table || []

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-24">
        
        <div className="text-center space-y-6">
          <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
            Academic <span style={{ color: accentColor }}>Portfolio.</span>
          </h3>
          <p className="text-slate-500 font-black uppercase text-[11px] tracking-[0.6em]">
            Premium courses directly pulled from the 2025 curriculum data.
          </p>
        </div>
        
        {popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {popularCourses.map((c: any, i: number) => (
              <div 
                key={i} 
                className="group p-8 sm:p-12 rounded-[4.5rem] bg-white/5 border border-white/5 hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/30 transition-all relative overflow-hidden shadow-2xl"
              >
                <div className="w-20 h-20 bg-[#060818] rounded-3xl flex items-center justify-center text-4xl mb-12 border border-white/10 group-hover:scale-110 transition-all" style={{ color: accentColor }}>
                  <GraduationCap className="w-10 h-10" />
                </div>
                
                <h4 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight group-hover:text-[#F59E0B] transition-colors">
                  {c.course_name}
                </h4>
                
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-12">
                  Requirement: {c.eligibility}
                </p>
                
                <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">
                      Estimated Fees
                    </div>
                    <div className="text-white font-black text-xl sm:text-2xl">
                      {c.fees}
                    </div>
                  </div>
                  <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F59E0B] hover:text-[#060818] transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-[4rem] bg-white/5 border border-white/10">
            <GraduationCap className="w-16 h-16 mx-auto text-slate-600 mb-6" />
            <p className="text-slate-400 font-semibold text-lg">No courses information available</p>
          </div>
        )}
      </div>
    </div>
  )
}