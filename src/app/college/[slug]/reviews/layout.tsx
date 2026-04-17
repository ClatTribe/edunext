import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/reviews`

  return {
    title: `${name} Student Reviews & Ratings 2026`,
    description: `Read authentic student reviews, ratings, and feedback on campus life, faculty, and facilities at ${name}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Student Reviews & Ratings 2026`,
      description: `Read authentic student reviews, ratings, and feedback on campus life, faculty, and facilities at ${name}.`,
      url: url,
    }
  }
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
