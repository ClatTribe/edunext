"use client"
import React, { useState, useEffect } from "react"
import { supabase } from "../../../../../lib/supabase"
import { useParams } from "next/navigation"
import { BookOpen, Clock, IndianRupee, GraduationCap, Loader2, AlertCircle } from "lucide-react"

const accentColor = '#F59E0B'
const primaryBg = '#050818'
const secondaryBg = '#0F172B'
const borderColor = 'rgba(245, 158, 11, 0.15)'

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

  const courses = micrositeData?.courses_offered_list || []
  const popularCourses = micrositeData?.popular_courses_table || []

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: primaryBg }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Courses Offered</h1>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {courses.map((course: any, index: number) => (
              <div
                key={index}
                className="rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all backdrop-blur-xl"
                style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{course.name}</h3>
                
                {course.meta_info && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.meta_info.map((info: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}
                      >
                        {info}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {course.total_fees && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <IndianRupee size={16} style={{ color: accentColor }} />
                      <span className="font-semibold">{course.total_fees}</span>
                    </div>
                  )}
                  
                  {course.eligibility && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <GraduationCap size={16} style={{ color: accentColor }} />
                      <span>Eligibility: {course.eligibility}</span>
                    </div>
                  )}
                </div>

                {course.url && (
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: accentColor }}
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No courses information available</p>
          </div>
        )}

        {/* Popular Courses Table */}
        {popularCourses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Popular Courses</h2>
            <div className="rounded-xl overflow-hidden backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <th className="text-left p-4 text-slate-300 font-semibold">Course</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Fees</th>
                      <th className="text-left p-4 text-slate-300 font-semibold">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularCourses.map((course: any, index: number) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${borderColor}` }} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 text-white font-medium">{course.course_name}</td>
                        <td className="p-4 text-slate-300">{course.fees}</td>
                        <td className="p-4 text-slate-300">{course.eligibility || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}