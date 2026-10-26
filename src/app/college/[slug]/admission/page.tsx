import React from "react"
import { supabase } from "../../../../../lib/supabase"
import AdmissionClient from "./AdmissionClient"
import Link from "next/link"
import { MBA_PARTNERS } from "../../../../../lib/mbaForms"
import { mbaMeta, cleanLocation } from "../../../../../lib/collegeSeo"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Admission | EduNext" }

  const name = college.college_name
  const location = cleanLocation(college.location)

  const mba = mbaMeta("admission", slug, name, college.location)
  if (mba) return mba

  return {
    title: `${name} Admission 2026 — Application Form, Eligibility, Dates & Process`,
    description: `${name} admission 2026: application form dates, eligibility criteria, fees, entrance exams accepted, and step-by-step process. Apply now for 2026-27 academic year${location ? ` in ${location}` : ""}.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/admission`
    },
    openGraph: {
      title: `${name} Admission 2026 — Application Form, Eligibility, Dates & Process`,
      description: `${name} admission 2026: application form dates, eligibility criteria, fees, entrance exams accepted, and step-by-step process. Apply now for 2026-27 academic year${location ? ` in ${location}` : ""}.`,
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

  const partner = MBA_PARTNERS.find((p) => p.micrositeSlug === slug)

  return (
    <>
      {partner && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm">
          <span className="font-semibold text-white">{college.college_name} application form 2027-29: </span>
          <Link href={`/mba-forms/${partner.slug}`} className="text-amber-400 underline">check last date &amp; apply link</Link>
          <span className="text-slate-400"> · </span>
          <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">all MBA forms open now</Link>
        </div>
      )}
      <AdmissionClient admissionData={admissionData} uniqueHeadings={uniqueHeadings} />
    </>
  )
}
