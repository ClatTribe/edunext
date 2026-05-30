import React from "react"
import { supabase } from "../../../../../lib/supabase"
import CutoffClient from "./CutoffClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Cutoff | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`,
    description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility in ${location}. Updated for 2026.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/cutoff`
    },
    openGraph: {
      title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`,
      description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility in ${location}. Updated for 2026.`,
    }
  }
}

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
