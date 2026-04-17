import { supabase } from "../../../../lib/supabase"
import CollegeLayoutClient from "./CollegeLayoutClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params  // ← await params here

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name, location")
    .eq("slug", slug)
    .single()

  if (!college) return { title: "College | EduNext" }

  const name = college.college_name
  const location = college.location

  return {
    title: `${name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
    description: `${name} is an institute in ${location}. Read for details on ${name} Fees, Admission 2026, Courses, Cutoff, Ranking and Placement.`,
    alternates: {
      canonical: `https://www.getedunext.com/college/${slug}`
    },
    openGraph: {
      title: `${name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,
      description: `${name} is an institute in ${location}.`,
    }
  }
}

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return <CollegeLayoutClient>{children}</CollegeLayoutClient>
}