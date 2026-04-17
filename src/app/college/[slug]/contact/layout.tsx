import { supabase } from "../../../../../lib/supabase"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: college } = await supabase
    .from("college_microsites")
    .select("college_name")
    .eq("slug", slug)
    .single()

  const name = college?.college_name || "College"
  const url = `https://www.getedunext.com/college/${slug}/contact`

  return {
    title: `Contact ${name} - Address & Details`,
    description: `Get the official contact details, campus address, and mapped location for ${name}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Contact ${name} - Address & Details`,
      description: `Get the official contact details, campus address, and mapped location for ${name}.`,
      url: url,
    }
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
