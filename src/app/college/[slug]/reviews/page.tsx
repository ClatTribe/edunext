import React from "react"
import { supabase } from "../../../../../lib/supabase"
import ReviewsClient from "./ReviewsClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Reviews | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name} Reviews & Ratings 2026`,
    description: `Read authentic student reviews and ratings for ${name}, ${location}.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/reviews`
    },
    openGraph: {
      title: `${name} Reviews & Ratings 2026`,
      description: `Read authentic student reviews and ratings for ${name}, ${location}.`,
    }
  }
}

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
