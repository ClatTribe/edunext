import React from "react"
import { supabase } from "../../../../../lib/supabase"
import RankingClient from "./RankingClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Ranking | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name} Ranking 2026`,
    description: `Check out the national and international rankings and recognition for ${name}, ${location}.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/ranking`
    },
    openGraph: {
      title: `${name} Ranking 2026`,
      description: `Check out the national and international rankings and recognition for ${name}, ${location}.`,
    }
  }
}

export default async function RankingPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const rankingData: any[] = micrositeData?.ranking || college?.ranking || []
  const uniqueHeadings = Array.from(new Set(rankingData.map(item => item.heading?.trim() || "General Recognition")))

  return (
    <RankingClient rankingData={rankingData} uniqueHeadings={uniqueHeadings} />
  )
}
