import React from "react"
import { supabase } from "../../../../../lib/supabase"
import CourseFeesClient from "./CourseFeesClient"

export default async function CoursesAndFeesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: college } = await supabase
    .from("college_microsites")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!college) return null

  const micrositeData = typeof college.microsite_data === 'string'
    ? JSON.parse(college.microsite_data)
    : college.microsite_data

  const rawFees: any[] = micrositeData?.fees || college?.fees || []
  const uniqueHeadings = Array.from(new Set(rawFees.map(item => item.heading?.trim() || "General Courses")))

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 py-12 pb-24">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-12 bg-amber-500" />
          <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">Academic & Financials</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
          Courses & <span className="text-amber-500">Fees.</span>
        </h1>
      </div>

      <CourseFeesClient rawFees={rawFees} uniqueHeadings={uniqueHeadings} />
    </div>
  )
}