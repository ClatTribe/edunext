import React from "react"
import { supabase } from "../../../../../lib/supabase"
import RankingClient from "./RankingClient"

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
