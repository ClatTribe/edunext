"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { GraduationCap, Loader2 } from "lucide-react"

const accentColor = '#F59E0B';
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10" style={{ color: accentColor }} />
      </div>
    )
  }

  const micrositeData = typeof college?.microsite_data === 'string' 
    ? JSON.parse(college.microsite_data) 
    : college?.microsite_data

  const coursesData = college?.courses
  const popularCourses = coursesData === "See Fees Section" 
    ? (college?.microsite_data?.fees?.[0]?.rows?.map((row: any) => ({
        course_name: row[0],
        eligibility: row[1],
        fees: row[2]
      })) || [])
    : (micrositeData?.popular_courses_table || [])

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8" style={{ backgroundColor: accentColor }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accentColor }}>
            Available Programs
          </span>
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          Academic <span style={{ color: accentColor }}>Portfolio.</span>
        </h3>
      </div>

      {popularCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
          {popularCourses.map((c: any, i: number) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-[2rem] border transition-all duration-500 hover:border-amber-500/40 overflow-hidden shadow-xl hover:-translate-y-2"
              style={{ 
                backgroundColor: secondaryBg,
                borderColor: borderColor
              }}
            >
              {/* Animated Background Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Top Row: Icon and Eligibility */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110" 
                    style={{ 
                      backgroundColor: '#050818', 
                      borderColor: borderColor,
                      color: accentColor 
                    }}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white/10 text-white/50 bg-white/5 group-hover:border-amber-500/30 group-hover:text-amber-200 transition-colors">
                    {c.eligibility || 'N/A'}
                  </div>
                </div>
                
                {/* Course Name */}
                <h4 className="text-xl font-bold text-white mb-6 group-hover:text-amber-400 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                  {c.course_name}
                </h4>
                
                {/* Bottom Row: Fees */}
                <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1 text-white/30 group-hover:text-amber-500/50 transition-colors">
                      Estimated Fees
                    </p>
                    <p className="text-2xl font-black text-white group-hover:scale-105 origin-left transition-transform">
                      {c.fees || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Glow */}
              <div 
                className="absolute -right-8 -bottom-8 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-500" 
                style={{ backgroundColor: accentColor }}
              ></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: accentColor }} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No curriculum data found</p>
        </div>
      )}
    </div>
  )
}