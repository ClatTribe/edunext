import React from "react"
import { supabase } from "../../../../../lib/supabase"
import AdmissionClient from "./AdmissionClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Admission | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name} Admission 2026`,
    description: `Get complete details on the admission process, dates, and eligibility for ${name}, ${location}.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/admission`
    },
    openGraph: {
      title: `${name} Admission 2026`,
      description: `Get complete details on the admission process, dates, and eligibility for ${name}, ${location}.`,
    }
  }
}

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
