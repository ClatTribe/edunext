import React from "react"
import { supabase } from "../../../../../lib/supabase"
import ContactClient from "./ContactClient"

export default async function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const { data: college } = await supabase
    .from("college_microsites")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!college) return null

  return (
    <ContactClient college={college} />
  )
}
