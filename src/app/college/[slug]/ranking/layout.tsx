import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/ranking`

  return {
    title: `${name} Rankings & Awards 2026`,
    description: `Check out the latest national and international rankings, awards, and accreditations for ${name}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Rankings & Awards 2026`,
      description: `Check out the latest national and international rankings, awards, and accreditations for ${name}.`,
      url: url,
    }
  }
}

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
