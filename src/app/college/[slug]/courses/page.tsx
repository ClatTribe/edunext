"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { GraduationCap, Loader2, AlertCircle, ArrowRight } from "lucide-react"

// Updated Color Palette
const accentColor = '#F59E0B';
const primaryBg = '#050818'; 
const secondaryBg = '#0F172B';
const borderColor = 'rgba(245, 158, 11, 0.15)';

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

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const coursesData = college?.courses
  const popularCourses = coursesData === "See Fees Section" 
    ? (college?.fees?.[0]?.rows?.map((row: any) => ({
        course_name: row[0],
        eligibility: row[1],
        fees: row[2]
      })) || [])
    : (micrositeData?.popular_courses_table || [])

  return (
    <div className="min-h-screen p-6 sm:p-12" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12" style={{ backgroundColor: accentColor }}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: accentColor }}>
              Available Programs
            </span>
          </div>
          <h3 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Academic <br />
            <span style={{ color: accentColor }}>Portfolio.</span>
          </h3>
        </div>

        {popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((c: any, i: number) => (
              <div 
                key={i} 
                className="group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl"
                style={{ 
                  backgroundColor: secondaryBg,
                  borderColor: borderColor
                }}
              >
                {/* Decorative Background Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 blur-[80px] rounded-full opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: accentColor }}></div>

                {/* Icon Box */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:rotate-6 group-hover:scale-110" 
                  style={{ 
                    backgroundColor: primaryBg, 
                    borderColor: borderColor,
                    color: accentColor 
                  }}>
                  <GraduationCap className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <div className="space-y-4 mb-10">
                  <h4 className="text-2xl font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                    {c.course_name}
                  </h4>
                  <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{ borderColor: borderColor, color: 'rgba(255,255,255,0.5)' }}>
                    {c.eligibility}
                  </div>
                </div>
                
                {/* Footer Section */}
                <div className="pt-8 border-t flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-40 text-white">
                      Estimated Fees
                    </p>
                    <p className="text-xl font-black text-white">
                      {c.fees}
                    </p>
                  </div>
                  
                  <button 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: borderColor,
                      color: accentColor
                    }}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 rounded-[3rem] border-2 border-dashed" style={{ borderColor: borderColor, backgroundColor: secondaryBg }}>
            <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-20" style={{ color: accentColor }} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No data found in current curriculum</p>
          </div>
        )}
      </div>
    </div>
  )
}