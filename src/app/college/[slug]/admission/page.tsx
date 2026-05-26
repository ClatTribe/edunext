import React from "react"
import { supabase } from "../../../../../lib/supabase"
import AdmissionClient from "./AdmissionClient"

export default async function AdmissionPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const admissionData: any[] = micrositeData?.admission || college?.admission || []
  const uniqueHeadings = Array.from(new Set(admissionData.map(item => item.heading?.trim() || "General Information")))

  return (
    <AdmissionClient admissionData={admissionData} uniqueHeadings={uniqueHeadings} />
  )
}
