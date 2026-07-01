import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import CollegeLayoutClient from "./CollegeLayoutClient"

export default async function CollegeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: college, error } = await supabase
    .from("college_microsites")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !college) {
    notFound()
  }

  return (
    <CollegeLayoutClient college={college}>
      {children}
    </CollegeLayoutClient>
  )
}
