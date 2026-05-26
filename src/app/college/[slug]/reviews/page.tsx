import React from "react"
import { supabase } from "../../../../../lib/supabase"
import ReviewsClient from "./ReviewsClient"

export default async function ReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const reviewsData = micrositeData?.reviews || college?.reviews
  const aggregateRating = reviewsData?.aggregate_rating

  return (
    <ReviewsClient aggregateRating={aggregateRating} />
  )
}
