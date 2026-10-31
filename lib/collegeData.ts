import { cache } from "react"
import { supabase } from "./supabase"
import { isManagementCollege } from "./collegeSeo"
import { getMbaFacts, splitLocation } from "./mbaFacts"

/** One Supabase read per request for /college/[slug]/* (metadata, layout and page share it). */
export const getCollege = cache(async (slug: string) => {
  const { data } = await supabase.from("college_microsites").select("*").eq("slug", slug).maybeSingle()
  return data as any | null
})

/** MBA facts for metadata; null for non-B-schools so callers fall back to the generic titles. */
export const getMbaMetaFacts = cache(async (slug: string) => {
  const college = await getCollege(slug)
  if (!college || !isManagementCollege(slug, college.college_name)) return null
  return getMbaFacts(college)
})

export interface SimilarSchool {
  slug: string
  name: string
  city: string
}

/**
 * Other B-schools in the same state (same city first), server-rendered so the
 * links are crawlable. The sidebar's RelatedColleges loads client-side and mixes in
 * engineering/medical colleges, so it does not help MBA pages rank.
 */
export const getSimilarBSchools = cache(async (slug: string, location: string, limit = 8): Promise<SimilarSchool[]> => {
  const { city, state } = splitLocation(location)
  const place = state || city
  if (!place) return []
  const { data } = await supabase
    .from("college_microsites")
    .select("slug, college_name, location")
    .ilike("location", `%${place}%`)
    .or(
      "college_name.ilike.%management%,college_name.ilike.%business%,college_name.ilike.%PGDM%,college_name.ilike.%MBA%,slug.like.iim-%"
    )
    .neq("slug", slug)
    .limit(80)
  const rows = (data || []).filter((r: any) => r.slug && isManagementCollege(r.slug, r.college_name))
  const lc = city.toLowerCase()
  rows.sort((a: any, b: any) => {
    const ac = lc && String(a.location).toLowerCase().includes(lc) ? 0 : 1
    const bc = lc && String(b.location).toLowerCase().includes(lc) ? 0 : 1
    if (ac !== bc) return ac - bc
    const ai = a.slug.startsWith("iim-") ? 0 : 1
    const bi = b.slug.startsWith("iim-") ? 0 : 1
    return ai - bi || String(a.college_name).length - String(b.college_name).length
  })
  return rows.slice(0, limit).map((r: any) => ({ slug: r.slug, name: r.college_name, city: splitLocation(r.location).city }))
})
