import { NextResponse } from "next/server"
import { supabase } from "../../../../../lib/supabase"
import { getFormRow } from "../../../../../lib/mbaForms"

// Tracked redirect to the school's official portal. Each click is logged so partners can see what EduNext sends them.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const row = await getFormRow(slug)
  if (!row?.form_url) return NextResponse.redirect(new URL(`/mba-forms/${slug}`, req.url), 302)
  try {
    await supabase.from("mba_form_clicks").insert({ slug, referrer: req.headers.get("referer") })
  } catch { /* never block the redirect */ }
  const u = new URL(row.form_url)
  u.searchParams.set("utm_source", "edunext")
  u.searchParams.set("utm_medium", "mba_forms_hub")
  u.searchParams.set("utm_campaign", "admissions_2027")
  return NextResponse.redirect(u.toString(), 302)
}
