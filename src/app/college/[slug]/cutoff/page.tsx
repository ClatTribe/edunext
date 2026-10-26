import React from "react"
import { supabase } from "../../../../../lib/supabase"
import { mbaMeta, cleanLocation } from "../../../../../lib/collegeSeo"
import CutoffClient from "./CutoffClient"
import Link from "next/link"
import { isManagementCollege } from "../../../../../lib/collegeSeo"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: college } = await supabase.from("college_microsites").select("college_name, location").eq("slug", slug).single()
  
  if (!college) return { title: "Cutoff | EduNext" }

  const name = college.college_name
  const mba = mbaMeta("cutoff", slug, name, college.location)
  if (mba) return mba
  const location = cleanLocation(college.location)

  return {
    title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`,
    description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility${location ? ` in ${location}` : ""}. Updated for 2026.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}/cutoff`
    },
    openGraph: {
      title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`,
      description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility${location ? ` in ${location}` : ""}. Updated for 2026.`,
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

  const isBSchool = isManagementCollege(slug, college.college_name)

  return (
    <>
      {isBSchool && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-slate-300">
          <span className="font-semibold text-white">CAT 2026 (29 Nov): </span>
          <Link href="/cat-percentile-predictor" className="text-amber-400 underline">predict your CAT percentile</Link>
          <span className="text-slate-400"> · </span>
          <Link href="/cat-college-predictor" className="text-amber-400 underline">colleges you can get at your percentile</Link>
          <span className="text-slate-400"> · </span>
          <Link href="/forms-and-deadlines/mba" className="text-amber-400 underline">MBA forms open now</Link>
          {slug.startsWith("iim-") && (
            <>
              <span className="text-slate-400"> · </span>
              <Link href="/iim-cutoff" className="text-amber-400 underline">compare all 22 IIM cutoffs</Link>
            </>
          )}
        </div>
      )}
      <CutoffClient cutoffData={cutoffData} uniqueHeadings={uniqueHeadings} />
    </>
  )
}
