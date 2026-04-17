import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/placement`

  return {
    title: `${name} Placements 2026 - Highest & Average Package`,
    description: `Detailed report on ${name} placements, top recruiters, highest package, and average salary offered.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Placements 2026 - Highest & Average Package`,
      description: `Detailed report on ${name} placements, top recruiters, highest package, and average salary offered.`,
      url: url,
    }
  }
}

export default function PlacementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
