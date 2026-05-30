import React from "react"
import { supabase } from "../../../../../lib/supabase"
import PlacementClient from "./PlacementClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Placement | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name} Placement 2026 — Average Package, Top Recruiters & Branch-wise Salary`,
    description: `${name} placement report 2026: average CTC, highest salary package, top recruiting companies, branch-wise placement stats, and internship data for the ${location} campus. Full report inside.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/placement`
    },
    openGraph: {
      title: `${name} Placement 2026 — Average Package, Top Recruiters & Branch-wise Salary`,
      description: `${name} placement report 2026: average CTC, highest salary package, top recruiting companies, branch-wise placement stats, and internship data for the ${location} campus. Full report inside.`,
    }
  }
}

export default async function PlacementPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const placementData: any[] = micrositeData?.placement || college?.placement || []
  const uniqueHeadings = Array.from(new Set(placementData.map(item => item.heading?.trim() || "General Stats")))

  return (
    <PlacementClient placementData={placementData} uniqueHeadings={uniqueHeadings} />
  )
}
