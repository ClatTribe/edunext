import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/admission`

  return {
    title: `${name} Admission Process & Selection 2026`,
    description: `Check out the complete admission schedule, selection protocol and criteria for ${name}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} Admission Process & Selection 2026`,
      description: `Check out the complete admission schedule, selection protocol and criteria for ${name}.`,
      url: url,
    }
  }
}

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
