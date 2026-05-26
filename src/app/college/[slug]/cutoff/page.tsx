import React from "react"
import { supabase } from "../../../../../lib/supabase"
import CutoffClient from "./CutoffClient"

export default async function CutoffPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const cutoffData: any[] = micrositeData?.cutoff || college?.cutoff || []
  const uniqueHeadings = Array.from(new Set(cutoffData.map(item => item.heading?.trim() || "General Data")))

  return (
    <CutoffClient cutoffData={cutoffData} uniqueHeadings={uniqueHeadings} />
  )
}
