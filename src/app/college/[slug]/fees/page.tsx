"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { IndianRupee, Loader2, AlertCircle } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

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
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <IndianRupee size={32} style={{ color: accentColor }} />
          Fee Structure
        </h1>

        {popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {popularCourses.map((course: any, index: number) => (
              <div
                key={index}
                className="rounded-xl p-6 backdrop-blur-xl hover:shadow-lg transition-all"
                style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
              >
                <h3 className="text-lg font-bold text-white mb-3">{course.course_name}</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Total Fees</p>
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>
                      {course.fees}
                    </p>
                  </div>

                  {course.eligibility && course.eligibility !== '-' && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Eligibility</p>
                      <p className="text-sm text-slate-300">{course.eligibility}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <IndianRupee size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Fee information not available</p>
          </div>
        )}
      </div>
    </div>
  )
}