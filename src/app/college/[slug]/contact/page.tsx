import React from "react"
import { supabase } from "../../../../../lib/supabase"
import ContactClient from "./ContactClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Contact | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `Contact ${name} 2026`,
    description: `Get official contact details, address, and website information for ${name}, ${location}.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/contact`
    },
    openGraph: {
      title: `Contact ${name} 2026`,
      description: `Get official contact details, address, and website information for ${name}, ${location}.`,
    }
  }
}

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
