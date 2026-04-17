import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/cutoff`

  return {
    title: `${name} Cutoff & Merit Lists 2026`,
    description: `Check the latest cutoffs, merit lists, and rank requirements for admission into ${name}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Cutoff & Merit Lists 2026`,
      description: `Check the latest cutoffs, merit lists, and rank requirements for admission into ${name}.`,
      url: url,
    }
  }
}

export default function CutoffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
