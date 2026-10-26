import partners from "./mbaPartners.json"
import { supabase } from "./supabase"

export interface MbaPartner {
  slug: string
  school: string
  city: string
  region: string
  micrositeSlug: string | null
}

export interface MbaFormRow {
  slug: string
  school: string
  exams: string | null
  programme: string | null
  form_url: string | null
  last_date: string | null
  fee_text: string | null
  status: "reserved" | "draft" | "live" | "featured" | "paused"
}

export const MBA_PARTNERS = partners as MbaPartner[]

export function getPartner(slug: string): MbaPartner | undefined {
  return MBA_PARTNERS.find((p) => p.slug === slug)
}

/** Live form details, filled in when a school confirms. Returns null until the mba_forms table exists or has a row. */
export async function getFormRow(slug: string): Promise<MbaFormRow | null> {
  try {
    const { data, error } = await supabase.from("mba_forms").select("*").eq("slug", slug).maybeSingle()
    if (error) return null
    return (data as MbaFormRow) ?? null
  } catch {
    return null
  }
}

export const isLive = (r: MbaFormRow | null) => !!r && (r.status === "live" || r.status === "featured") && !!r.form_url
