import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/course-&-fees`

  return {
    title: `${name} Courses & Fees Structure 2026`,
    description: `Explore the complete list of courses offered by ${name} along with their detailed fee structure.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Courses & Fees Structure 2026`,
      description: `Explore the complete list of courses offered by ${name} along with their detailed fee structure.`,
      url: url,
    }
  }
}

export default function CourseFeesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
